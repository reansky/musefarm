# MUSEFARM 🌾

**MUSEFARM** is a Bankr app with live per-wallet farm state, Base wallet reads, x402 payments, and onchain transaction confirmation.

## 🌟 Key Architecture Changes
- **Bankr Runtime**: The frontend calls Bankr scripts for farm reads and writes. No localStorage farm or guest-wallet fallback is enabled.
- **Wallet Menu**: The Wallet tab shows live Base ETH/USDC balances, provides a deposit address, and prepares confirmed ETH/USDC withdrawals through Bankr.
- **x402 Payment Routing**: When players purchase premium seeds or expand land territory, the signed-in wallet pays the configured x402 endpoint on Base:
  `0x0b127f65d167159e4e2bf0b73c2975a14ac3d056` via USDC on Base (contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) with ETH fallback.
- **Live Farm Engine**: Plot state, crops, stamina, leveling, and leaderboard data persist in Bankr appKV records keyed by the signed-in wallet.

## 🚀 Runtime

Open MUSEFARM from the Bankr app runtime. The standalone GitHub Pages file intentionally shows a sign-in gate instead of a local/demo game, because Bankr supplies the authenticated wallet context and server-side scripts.

## ⚙️ Configuration
In `manifest.json` and `index.html`:
```javascript
// Creator wallet receiving all seed & land upgrade purchases
var CREATOR_WALLET = '0x0b127f65d167159e4e2bf0b73c2975a14ac3d056';

```
*Note: All game mutations require Bankr authentication. Wallet transfers use Base and require transaction confirmation plus network gas.*

## 🌾 Game Features
- **Interactive Plots**: 3x3 default grid, expandable to 4x4 (16 plots) and 5x5 (25 plots).
- **Crops & Seeds**: Free daily wheat (10/day) plus reusable premium crops (Sweet Corn, Golden Berry, Celestial Melon, Royal Truffle, Mythic Sunflower, Mythic Dragon Fruit, Cosmic Lotus).
- **Seed Synthesis**: Upgrade harvested crops into higher-tier seeds in the Barn.
- **Mastery & Stamina**: Automatic stamina regeneration (every 3 minutes) and level progression.
- **Rewards & Allocations**: 1 MUSE harvested = 2 $MUSEFARM token allocation.
