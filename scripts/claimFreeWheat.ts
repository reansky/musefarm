const wallet = ctx.caller && ctx.caller.walletAddress;
if (!wallet) {
  return { ok: false, error: 'Sign in required.' };
}
const key = 'record:farm_state/' + wallet.toLowerCase();
let state = await appKV.get(key);
if (!state) {
  return { ok: false, error: 'Open the farm first.' };
}
const now = Date.now();
const today = new Date().toISOString().slice(0, 10);
if (state.freeSeedDate !== today) {
  state.freeSeedDate = today;
  state.freeSeedClaimedToday = 0;
}

const DAILY_FREE_SEED_CAP = 10;
const claimed = state.freeSeedClaimedToday || 0;
if (claimed >= DAILY_FREE_SEED_CAP) {
  return {
    ok: false,
    error: 'Daily limit reached! You have already claimed 10/10 free seeds today. Resets at 00:00 UTC.'
  };
}

state.freeSeedClaimedToday = claimed + 1;
if (!state.seedInventory) state.seedInventory = {};
state.seedInventory.wheat = (state.seedInventory.wheat || 0) + 1;
state.lastFreeWheatAt = now;
state.updatedAt = now;
await appKV.set(key, state);

return {
  ok: true,
  state,
  added: 1,
  dailyFreeCap: DAILY_FREE_SEED_CAP,
  freeClaimedToday: state.freeSeedClaimedToday,
  freeClaimsRemaining: DAILY_FREE_SEED_CAP - state.freeSeedClaimedToday,
  now
};