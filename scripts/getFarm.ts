const SEED_CONFIG = {
  wheat: { name: 'Wheat', emoji: '🌾', costUsd: 0, growMs: 1*60*1000, yield: 5, free: true },
  corn: { name: 'Sweet Corn', emoji: '🌽', costUsd: 0.25, growMs: 2.5*60*1000, yield: 20, endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-corn' },
  berry: { name: 'Golden Berry', emoji: '🫐', costUsd: 1, growMs: 7.5*60*1000, yield: 90, endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-berry' },
  melon: { name: 'Celestial Melon', emoji: '🍈', costUsd: 2.5, growMs: 22.5*60*1000, yield: 250, endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-melon' },
  truffle: { name: 'Royal Truffle', emoji: '🍄', costUsd: 5, growMs: 60*60*1000, yield: 600, endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-truffle' },
  sunflower: { name: 'Mythic Sunflower', emoji: '🌻', costUsd: 12.5, growMs: 180*60*1000, yield: 1800, endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-sunflower' },
  dragonfruit: { name: 'Mythic Dragon Fruit', emoji: '🐲', costUsd: 25, growMs: 360*60*1000, yield: 4000, endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-dragonfruit' },
  lotus: { name: 'Cosmic Lotus', emoji: '🪷', costUsd: 50, growMs: 720*60*1000, yield: 10000, endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-lotus' }
};

const RECIPES = [
  { from: 'wheat', fromQty: 10, to: 'corn', toQty: 1, name: 'Sweet Corn', emoji: '🌽', desc: '10 Harvested Wheat ➔ 1 Sweet Corn Seed' },
  { from: 'corn', fromQty: 5, to: 'berry', toQty: 1, name: 'Golden Berry', emoji: '🫐', desc: '5 Harvested Corn ➔ 1 Golden Berry Seed' },
  { from: 'berry', fromQty: 4, to: 'melon', toQty: 1, name: 'Celestial Melon', emoji: '🍈', desc: '4 Harvested Berry ➔ 1 Celestial Melon Seed' },
  { from: 'melon', fromQty: 3, to: 'truffle', toQty: 1, name: 'Royal Truffle', emoji: '🍄', desc: '3 Harvested Melon ➔ 1 Royal Truffle Seed' },
  { from: 'truffle', fromQty: 3, to: 'sunflower', toQty: 1, name: 'Mythic Sunflower', emoji: '🌻', desc: '3 Harvested Truffle ➔ 1 Mythic Sunflower Seed' },
  { from: 'sunflower', fromQty: 2, to: 'dragonfruit', toQty: 1, name: 'Mythic Dragon Fruit', emoji: '🐲', desc: '2 Harvested Sunflower ➔ 1 Mythic Dragon Fruit Seed' },
  { from: 'dragonfruit', fromQty: 2, to: 'lotus', toQty: 1, name: 'Cosmic Lotus', emoji: '🪷', desc: '2 Harvested Dragon Fruit ➔ 1 Cosmic Lotus Seed' }
];

const GRID_CONFIG = {
  '3x3': { size: 3, plots: 9, costUsd: 0, name: 'Standard 3x3 (9 Plots)' },
  '4x4': { size: 4, plots: 16, costUsd: 5, name: 'Expanded 4x4 (16 Plots)', endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-grid-4x4' },
  '5x5': { size: 5, plots: 25, costUsd: 7, name: 'Estate 5x5 (25 Plots)', endpoint: 'https://x402.bankr.bot/0x0b127f65d167159e4e2bf0b73c2975a14ac3d056/musefarm-grid-5x5' }
};

const MAX_STAMINA = 20;
const STAMINA_REGEN_MS = 3*60*1000;
const DAILY_FREE_SEED_CAP = 10;
const PLOT_COUNT = 9;

function freshState(wallet) {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  return {
    walletAddress: wallet,
    muse: 20,
    level: 1,
    gridSize: 3,
    stamina: MAX_STAMINA,
    staminaUpdatedAt: now,
    lastFreeWheatAt: 0,
    freeSeedDate: today,
    freeSeedClaimedToday: 0,
    plots: Array.from({length: PLOT_COUNT}, (_, i) => ({ index: i, state: 'empty', seedType: '', plantedAt: 0 })),
    seedInventory: { wheat: 5, corn: 0, berry: 0, melon: 0, truffle: 0, sunflower: 0, dragonfruit: 0, lotus: 0 },
    harvestInventory: { wheat: 0, corn: 0, berry: 0, melon: 0, truffle: 0, sunflower: 0, dragonfruit: 0, lotus: 0 },
    totalHarvested: 0,
    createdAt: now,
    updatedAt: now,
  };
}

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
  return { ok: false, error: 'Sign in required to open your farm.' };
}
const walletLc = wallet.toLowerCase();
const key = 'record:farm_state/' + walletLc;
let state = await appKV.get(key);
if (!state || !Array.isArray(state.plots)) {
  state = freshState(wallet);
} else {
  state = recalc(state);
  if (!state.seedInventory) state.seedInventory = { wheat: 5, corn: 0, berry: 0, melon: 0, truffle: 0, sunflower: 0, dragonfruit: 0, lotus: 0 };
  if (!state.harvestInventory) state.harvestInventory = { wheat: 0, corn: 0, berry: 0, melon: 0, truffle: 0, sunflower: 0, dragonfruit: 0, lotus: 0 };
  for (const k of Object.keys(SEED_CONFIG)) {
    if (typeof state.seedInventory[k] !== 'number') state.seedInventory[k] = 0;
    if (typeof state.harvestInventory[k] !== 'number') state.harvestInventory[k] = 0;
  }
}

// Reset daily free claims at UTC midnight
const today = new Date().toISOString().slice(0, 10);
if (state.freeSeedDate !== today) {
  state.freeSeedDate = today;
  state.freeSeedClaimedToday = 0;
}

// Check pending credits from x402 seed purchases
const paidSeeds = ['corn', 'berry', 'melon', 'truffle', 'sunflower', 'dragonfruit', 'lotus'];
let credited = [];
for (const st of paidSeeds) {
  const creditKey = 'shop_credit_' + st + '_' + walletLc;
  try {
    const cr = await appKV.get(creditKey);
    if (cr && typeof cr.pending === 'number' && cr.pending > 0) {
      state.seedInventory[st] = (state.seedInventory[st] || 0) + cr.pending;
      credited.push({ seedType: st, qty: cr.pending });
      await appKV.set(creditKey, { pending: 0, seedType: st, claimedAt: Date.now() });
    }
  } catch (e) {
    log('credit check error for ' + st, String(e));
  }
}

// Check pending grid upgrade credits
let upgradedGrid = null;
const upgradeKey = 'grid_upgrade_credit_' + walletLc;
try {
  const up = await appKV.get(upgradeKey);
  if (up && up.pending && typeof up.gridSize === 'number') {
    const targetSize = up.gridSize;
    if (targetSize > (state.gridSize || 3)) {
      state.gridSize = targetSize;
      upgradedGrid = targetSize;
    }
    await appKV.set(upgradeKey, { ...up, pending: false, appliedAt: Date.now() });
  }
} catch (e) {
  log('grid upgrade check error', String(e));
}

// Ensure plots match current gridSize (3x3=9, 4x4=16, 5x5=25)
if (!state.gridSize) state.gridSize = 3;
const desiredPlots = state.gridSize * state.gridSize;
while (state.plots.length < desiredPlots) {
  state.plots.push({ index: state.plots.length, state: 'empty', seedType: '', plantedAt: 0 });
}

state.updatedAt = Date.now();
await appKV.set(key, state);
return {
  ok: true,
  state,
  seedConfig: SEED_CONFIG,
  seedRecipes: RECIPES,
  gridConfig: GRID_CONFIG,
  maxStamina: MAX_STAMINA,
  staminaRegenMs: STAMINA_REGEN_MS,
  dailyFreeCap: DAILY_FREE_SEED_CAP,
  freeClaimedToday: state.freeSeedClaimedToday || 0,
  freeClaimsRemaining: Math.max(0, DAILY_FREE_SEED_CAP - (state.freeSeedClaimedToday || 0)),
  credited,
  upgradedGrid,
  now: Date.now()
};
