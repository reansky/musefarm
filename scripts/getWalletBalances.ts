const wallet = ctx.caller && ctx.caller.walletAddress;
if (!wallet) return { ok: false, error: 'Sign in required.' };

function formatUnits(value, decimals) {
  let raw = String(value).replace(/n$/, '');
  raw = raw.replace(/^0+/, '') || '0';
  if (raw.length <= decimals) raw = raw.padStart(decimals + 1, '0');
  const whole = raw.slice(0, -decimals) || '0';
  const fraction = raw.slice(-decimals).replace(/0+$/, '');
  return fraction ? whole + '.' + fraction : whole;
}

const nativeRaw = await bankr.chain.getBalance({ chain: 'base', address: wallet });
const usdcRaw = await bankr.chain.readContract({
  chain: 'base',
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  abi: ['function balanceOf(address owner) view returns (uint256)'],
  functionName: 'balanceOf',
  args: [wallet],
});

return {
  ok: true,
  address: wallet,
  nativeEth: formatUnits(nativeRaw, 18),
  usdc: formatUnits(usdcRaw, 6),
  updatedAt: Date.now(),
};
