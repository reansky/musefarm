const asset = String((args && args.asset) || '').toUpperCase();
const amount = String((args && args.amount) || '').trim();
const destination = String((args && args.destination) || '').trim();

if (!/^0x[a-fA-F0-9]{40}$/.test(destination)) {
  return { ok: false, error: 'Enter a valid destination wallet address.' };
}
if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
  return { ok: false, error: 'Enter a valid withdrawal amount.' };
}

function toUnits(value, decimals) {
  const parts = value.split('.');
  const whole = parts[0] || '0';
  const fraction = (parts[1] || '').padEnd(decimals, '0');
  if (fraction.length > decimals || (fraction && !/^\d+$/.test(fraction))) throw new Error('Invalid amount.');
  return BigInt(whole + fraction.slice(0, decimals));
}

if (asset === 'ETH') {
  const tx = await bankr.tx.prepare({
    chain: 'base',
    to: destination,
    value: '0x' + toUnits(amount, 18).toString(16),
    label: 'Withdraw ETH on Base',
  });
  return { ok: true, tx };
}

if (asset === 'USDC') {
  const data = await bankr.chain.encodeFunctionData({
    abi: ['function transfer(address to, uint256 amount) returns (bool)'],
    functionName: 'transfer',
    args: [destination, toUnits(amount, 6)],
  });
  const tx = await bankr.tx.prepare({
    chain: 'base',
    to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    data,
    label: 'Withdraw USDC on Base',
  });
  return { ok: true, tx };
}

return { ok: false, error: 'Unsupported withdrawal asset.' };
