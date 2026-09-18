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

const RECIPES = [
  { from: 'wheat', fromQty: 10, to: 'corn', toQty: 1, name: 'Sweet Corn', emoji: '🌽', desc: '10 Harvested Wheat ➔ 1 Sweet Corn Seed' },
  { from: 'corn', fromQty: 5, to: 'berry', toQty: 1, name: 'Golden Berry', emoji: '🫐', desc: '5 Harvested Corn ➔ 1 Golden Berry Seed' },
  { from: 'berry', fromQty: 4, to: 'melon', toQty: 1, name: 'Celestial Melon', emoji: '🍈', desc: '4 Harvested Berry ➔ 1 Celestial Melon Seed' },
  { from: 'melon', fromQty: 3, to: 'truffle', toQty: 1, name: 'Royal Truffle', emoji: '🍄', desc: '3 Harvested Melon ➔ 1 Royal Truffle Seed' },
  { from: 'truffle', fromQty: 3, to: 'sunflower', toQty: 1, name: 'Mythic Sunflower', emoji: '🌻', desc: '3 Harvested Truffle ➔ 1 Mythic Sunflower Seed' },
  { from: 'sunflower', fromQty: 2, to: 'dragonfruit', toQty: 1, name: 'Mythic Dragon Fruit', emoji: '🐲', desc: '2 Harvested Sunflower ➔ 1 Mythic Dragon Fruit Seed' },
  { from: 'dragonfruit', fromQty: 2, to: 'lotus', toQty: 1, name: 'Cosmic Lotus', emoji: '🪷', desc: '2 Harvested Dragon Fruit ➔ 1 Cosmic Lotus Seed' }
];

const wallet = ctx.caller && ctx.caller.walletAddress;
if (!wallet) {
  return { ok: true, smokeTest: true, recipes: RECIPES };
}
const key = 'record:farm_state/' + wallet.toLowerCase();
let state = await appKV.get(key);
if (!state) {
  return { ok: false, error: 'Open the farm game first.' };
}
if (!state.harvestInventory) {
  state.harvestInventory = { wheat: 0, corn: 0, berry: 0, melon: 0, truffle: 0, sunflower: 0, dragonfruit: 0, lotus: 0 };
}
if (!state.seedInventory) {
  state.seedInventory = { wheat: 0, corn: 0, berry: 0, melon: 0, truffle: 0, sunflower: 0, dragonfruit: 0, lotus: 0 };
}

const fromSeed = String((args && args.fromSeed) || 'wheat');
const recipe = RECIPES.find(r => r.from === fromSeed);
if (!recipe) {
  return { ok: false, error: 'Invalid seed upgrade recipe.' };
}

const mult = Math.max(1, Math.min(50, Math.floor(Number((args && args.multiplier) || 1))));
const needQty = recipe.fromQty * mult;
const currentHarvested = state.harvestInventory[recipe.from] || 0;

if (currentHarvested < needQty) {
  const fromCfg = SEED_CONFIG[recipe.from] || { name: recipe.from };
  return {
    ok: false,
    error: 'Not enough harvested ' + fromCfg.name + '! Need ' + needQty + 'x harvested ' + fromCfg.name + ' (you currently have ' + currentHarvested + '). Plant seeds and harvest your crops first!'
  };
}

state.harvestInventory[recipe.from] -= needQty;
state.seedInventory[recipe.to] = (state.seedInventory[recipe.to] || 0) + (recipe.toQty * mult);
state.updatedAt = Date.now();
await appKV.set(key, state);

return {
  ok: true,
  state,
  recipe,
  craftedQty: recipe.toQty * mult,
  craftedName: recipe.name,
  craftedEmoji: recipe.emoji,
  seedConfig: SEED_CONFIG,
  seedRecipes: RECIPES,
  now: Date.now()
};