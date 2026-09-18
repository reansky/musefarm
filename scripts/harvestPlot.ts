const SEED_CONFIG = {
  wheat: { name: 'Wheat', emoji: '🌾', costUsd: 0, growMs: 1*60*1000, yield: 5, free: true },
  corn: { name: 'Sweet Corn', emoji: '🌽', costUsd: 0.25, growMs: 2.5*60*1000, yield: 20 },
  berry: { name: 'Golden Berry', emoji: '🫐', costUsd: 1, growMs: 7.5*60*1000, yield: 90 },
  melon: { name: 'Celestial Melon', emoji: '🍈', costUsd: 2.5, growMs: 22.5*60*1000, yield: 250 },
  truffle: { name: 'Royal Truffle', emoji: '🍄', costUsd: 5, growMs: 60*60*1000, yield: 600 },
  sunflower: { name: 'Mythic Sunflower', emoji: '🌻', costUsd: 12.5, growMs: 180*60*1000, yield: 1800 },
  dragonfruit: { name: 'Mythic Dragon Fruit', emoji: '🐲', costUsd: 25, growMs: 360*60*1000, yield: 4000 },
  lotus: { name: 'Cosmic Lotus', emoji: '🪷', costUsd: 50, growMs: 720*60*1000, yield: 10000 }
};
const MAX_STAMINA = 20;
const STAMINA_REGEN_MS = 3*60*1000;

function recalc(state) {
  const now = Date.now();
  if (state.stamina < MAX_STAMINA) {
    const elapsed = now - state.staminaUpdatedAt;
    const gained = Math.floor(elapsed / STAMINA_REGEN_MS);
    if (gained > 0) {
      state.stamina = Math.min(MAX_STAMINA, state.stamina + gained);
      state.staminaUpdatedAt = state.staminaUpdatedAt + gained * STAMINA_REGEN_MS;
    }
  } else {
    state.staminaUpdatedAt = now;
  }
  state.plots = state.plots.map(p => {
    if (p.state === 'growing') {
      const cfg = SEED_CONFIG[p.seedType];
      if (cfg && now >= p.plantedAt + cfg.growMs) return { ...p, state: 'ready' };
    }
    return p;
  });
  return state;
}

const wallet = ctx.caller && ctx.caller.walletAddress;
if (!wallet || !args || typeof args.plotIndex === 'undefined') {
  return { ok: true, smokeTest: true };
}
const key = 'record:farm_state/' + wallet.toLowerCase();
let state = await appKV.get(key);
if (!state) {
  return { ok: false, error: 'Open the farm first.' };
}
state = recalc(state);

const plotIndex = Number(args.plotIndex);
if (!Number.isInteger(plotIndex) || plotIndex < 0 || plotIndex >= state.plots.length) {
  return { ok: false, error: 'Invalid plot.' };
}
const plot = state.plots[plotIndex];
if (plot.state !== 'ready') {
  await appKV.set(key, state);
  return { ok: false, error: 'That plot is not ready yet.', state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS };
}
const cfg = SEED_CONFIG[plot.seedType];
if (!cfg) {
  return { ok: false, error: 'Corrupt plot data.' };
}

state.muse += cfg.yield;
state.totalHarvested += cfg.yield;
state.level = 1 + Math.floor(state.totalHarvested / 100);

if (!state.harvestInventory) {
  state.harvestInventory = { wheat: 0, corn: 0, berry: 0, melon: 0, truffle: 0, sunflower: 0, dragonfruit: 0, lotus: 0 };
}
state.harvestInventory[plot.seedType] = (state.harvestInventory[plot.seedType] || 0) + 1;

// Paid/Premium seeds are permanent & reusable: returns to inventory on harvest so it can be replanted forever!
const isPaidSeed = !cfg.free && plot.seedType !== 'wheat';
if (isPaidSeed) {
  if (!state.seedInventory) state.seedInventory = {};
  state.seedInventory[plot.seedType] = (state.seedInventory[plot.seedType] || 0) + 1;
}

state.plots[plotIndex] = { index: plotIndex, state: 'empty', seedType: '', plantedAt: 0 };
state.updatedAt = Date.now();
await appKV.set(key, state);
return {
  ok: true,
  state,
  seedConfig: SEED_CONFIG,
  maxStamina: MAX_STAMINA,
  staminaRegenMs: STAMINA_REGEN_MS,
  harvested: cfg.yield,
  harvestedCrop: plot.seedType,
  cropYieldName: cfg.name,
  seedReturned: isPaidSeed,
  harvestCount: state.harvestInventory[plot.seedType],
  now: Date.now()
};