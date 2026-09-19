# MUSEFARM

MUSEFARM is a Harvest Moon-inspired farming game with Privy social login, an embedded wallet, and multi-chain transactions signed directly by the player.

## Runtime

Open the GitHub Pages site. Privy must allow `https://reansky.github.io` and have Google and Twitter enabled as login methods.

Farm progress is stored locally per Privy wallet in the browser. Premium seeds and land expansions use direct transfers from the embedded Privy wallet to the configured creator wallet. Payments support USDG or ETH on Robinhood Chain, plus USDC or ETH on Base. Every transaction requires player confirmation and ETH gas on the selected network.

## Features

- X and Google sign-in through Privy.
- Harvest Moon valley HUD: wood-framed panels, tilled soil plots, and a field farmer sprite that walks to plant and harvest.
- Realistic seed kernels in the shop; planted crops grow through sprout, grow, and ripe stages on the field.
- Live Privy signer address and balances for Base and Robinhood Chain.
- Live `$MUSEFARM` ERC-20 balance on Robinhood Chain.
- 3x3 farm grid with 4x4 and 5x5 land expansions.
- Free Wheat claims, reusable premium seeds, crop harvesting, stamina regeneration, and seed synthesis.
- Local leaderboard and reward-score tracking.

Gameplay, payments, Privy login, land upgrades, and reward accounting remain local/read-only. The live `$MUSEFARM` contract is displayed from Robinhood Chain, while claims stay disabled until distribution infrastructure is configured.

## Configuration

Payment and network constants are defined in `index.html`:

```javascript
var CREATOR_WALLET = '0x0b127f65d167159e4e2bf0b73c2975a14ac3d056';
var ROBINHOOD_USDG_ADDRESS = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168';
var MUSEFARM_TOKEN_ADDRESS = '0x6d3855ce4996eb3a909606413658096719d25ba3';
```

Robinhood Chain uses chain ID `4663`, RPC `https://rpc.mainnet.chain.robinhood.com`, and ETH gas. Base uses chain ID `8453` and ETH gas.

`$MUSEFARM` is an 18-decimal ERC-20 on Robinhood Chain. The token balance is read-only in the wallet and rewards tab; claims remain disabled until a funded distributor and allocation snapshot are configured.
