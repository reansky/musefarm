const SEED_CONFIG = {
  wheat:       { name: 'Wheat',              emoji: '🌾', growMs: 1*60*1000,    yield: 5,     usdPrice: 0 },
  corn:        { name: 'Sweet Corn',         emoji: '🌽', growMs: 2.5*60*1000,  yield: 20,    usdPrice: 0.25 },
  berry:       { name: 'Golden Berry',       emoji: '🫐', growMs: 7.5*60*1000,  yield: 90,    usdPrice: 1 },
  melon:       { name: 'Celestial Melon',    emoji: '🍈', growMs: 22.5*60*1000, yield: 250,   usdPrice: 2.5 },
  truffle:     { name: 'Royal Truffle',      emoji: '🍄', growMs: 60*60*1000,   yield: 600,   usdPrice: 5 },
  sunflower:   { name: 'Mythic Sunflower',   emoji: '🌻', growMs: 180*60*1000,  yield: 1800,  usdPrice: 12.5 },
  dragonfruit: { name: 'Mythic Dragon Fruit',emoji: '🐲', growMs: 360*60*1000,  yield: 4000,  usdPrice: 25 },
  lotus:       { name: 'Cosmic Lotus',       emoji: '🪷', growMs: 720*60*1000,  yield: 10000, usdPrice: 50 },
};
const PAID_TYPES = ['corn','berry','melon','truffle','sunflower','dragonfruit','lotus'];
const MAX_STAMINA = 20;
const STAMINA_REGEN_MS = 3*60*1000;
const WHEAT_HOLD_CAP = 30;

function recalc(state) {
  const now = Date.now();
  if (state.stamina < MAX_STAMINA) {
    const elapsed = now - state.staminaUpdatedAt;
    const gained = Math.floor(elapsed / STAMINA_REGEN_MS);
    if (gained > 0) { state.stamina = Math.min(MAX_STAMINA, state.stamina + gained); state.staminaUpdatedAt += gained * STAMINA_REGEN_MS; }
  } else { state.staminaUpdatedAt = now; }
  if (!state.seedInventory) state.seedInventory = {};
  if (!state.appliedPurchased) state.appliedPurchased = {};
  for (const k of Object.keys(SEED_CONFIG)) { if (typeof state.seedInventory[k] !== 'number') state.seedInventory[k] = 0; }
  for (const t of PAID_TYPES) { if (typeof state.appliedPurchased[t] !== 'number') state.appliedPurchased[t] = 0; }
  return state;
}
async function applyPurchaseCredits(state, walletLc) {
  for (const t of PAID_TYPES) {
    let rec = null;
    try { rec = await appKV.get('shop_credit_' + t + '_' + walletLc); } catch (e) { continue; }
    const total = rec && typeof rec.pending === 'number' ? rec.pending : 0;
    const applied = state.appliedPurchased[t] || 0;
    if (total > applied) {
      state.seedInventory[t] = (state.seedInventory[t] || 0) + (total - applied);
      state.appliedPurchased[t] = total;
    }
  }
}

const wallet = ctx.caller && ctx.caller.walletAddress;
if (!wallet) {
  return { ok: false, error: 'Sign in required.' };
}
const walletLc = wallet.toLowerCase();
const key = 'record:farm_state/' + walletLc;
let state = await appKV.get(key);
if (!state) {
  return { ok: false, error: 'Open the farm first.' };
}
state = recalc(state);
await applyPurchaseCredits(state, walletLc);

const seedType = String((args && args.seedType) || '');
if (seedType !== 'wheat') {
  await appKV.set(key, state);
  return { ok: false, error: 'Pay with USDC in the shop to get this seed.', state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS };
}
const qty = Math.max(1, Math.min(5, Number((args && args.qty) || 1)));
const currentWheat = state.seedInventory.wheat || 0;
if (currentWheat + qty > WHEAT_HOLD_CAP) {
  await appKV.set(key, state);
  return { ok: false, error: 'Wheat storage full (max ' + WHEAT_HOLD_CAP + ') — plant some first.', state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS };
}
state.seedInventory.wheat = currentWheat + qty;
state.updatedAt = Date.now();
await appKV.set(key, state);
return { ok: true, state, seedConfig: SEED_CONFIG, maxStamina: MAX_STAMINA, staminaRegenMs: STAMINA_REGEN_MS, now: Date.now() };