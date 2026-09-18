const PREFIX = 'record:farm_state/';
let snap = await appKV.get('leaderboard_snapshot');
const force = Boolean(args && args.force);
const now = Date.now();

if (!force && snap && Array.isArray(snap.entries) && snap.entries.length > 0 && (now - (snap.updatedAt || 0) < 60 * 1000)) {
  return snap;
}

let entries = [];
try {
  const items = await appKV.list(PREFIX);
  const list = Array.isArray(items) ? items : [];
  for (const item of list.slice(0, 500)) {
    let s = null;
    let k = '';
    if (item && typeof item === 'object' && item.value) {
      s = item.value;
      k = item.key || '';
    } else if (typeof item === 'string') {
      k = item;
      s = await appKV.get(item);
    } else {
      s = item;
    }
    if (s && typeof s.totalHarvested === 'number') {
      entries.push({
        walletAddress: s.walletAddress || String(k).replace(PREFIX, ''),
        totalHarvested: s.totalHarvested,
        level: s.level || 1,
        muse: s.muse || 0,
      });
    }
  }
} catch (e) {
  log('getLeaderboard error', String(e));
}

entries.sort((a, b) => b.totalHarvested - a.totalHarvested);
const top = entries.slice(0, 20);
const result = { entries: top, count: top.length, updatedAt: now };
await appKV.set('leaderboard_snapshot', result);
return result;