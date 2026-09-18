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
if (!wallet) {
  return { ok: false, error: 'Sign in required.' };
}
const key = 'record:farm_state/' + wallet.toLowerCase();
let state = await appKV.get(key);
if (!state) {
  return { ok: false, error: 'Open the farm first.' };
}
state = recalc(state);

const plotIndex = Number(args && args.plotIndex);
const seedType = String((args && args.seedType) || '');
if (!Number.isInteger(plotIndex) || plotIndex < 0 || plotIndex >= state.plots.length) {
  return { ok: false, error: 'Invalid plot.' };
}
const cfg = SEED_CONFIG[seedType];
if (!cfg) {
  return { ok: false, error: 'Unknown seed type.' };
}
const plot = state.plots[plotIndex];
if (plot.state !== 'empty') {
  return { ok: false, error: 'That plot is not empty.', state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS };
}
if (state.stamina < 1) {
  return { ok: false, error: 'Not enough stamina — wait for it to regen.', state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS };
}
if ((state.seedInventory[seedType] || 0) < 1) {
  return { ok: false, error: 'No ' + cfg.name + ' seeds — get some from the shop first.', state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS };
}

state.stamina -= 1;
state.seedInventory[seedType] -= 1;
state.plots[plotIndex] = { index: plotIndex, state: 'growing', seedType, plantedAt: Date.now() };
state.updatedAt = Date.now();
await appKV.set(key, state);
return { ok: true, state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS, now: Date.now() };