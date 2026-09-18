# MUSEFARM 🌾

**MUSEFARM** uses Privy social login to create an embedded Ethereum wallet for each player, with Base wallet reads and onchain transaction signing.

## 🌟 Key Architecture Changes
- **Privy Login**: Players sign in with **X** or **Google**. After OAuth completes, the page calls Privy `createWallet()` and shows the embedded wallet address.
- **Wallet Status**: The sign-in panel shows the live Base ETH/USDC balance and BaseScan address for the Privy wallet.
- **Privy Transactions**: The embedded wallet exposes an EIP-1193 provider for confirmed Base transactions.
- **Bankr Payment Routing**: When the Bankr app runtime is present, premium purchases can use the configured x402 endpoint on Base:
  `0x0b127f65d167159e4e2bf0b73c2975a14ac3d056` via USDC on Base (contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) with ETH fallback.
- **Farm Engine**: The existing farm scripts remain available in the Bankr runtime. A farming smart contract or Privy-authenticated backend is still required before plot state can be claimed as fully on-chain.

## 🚀 Runtime

Open MUSEFARM at the GitHub Pages URL. Privy requires `https://reansky.github.io` to be an allowed domain and `Google` plus `Twitter` to be enabled in the Privy Dashboard.

## ⚙️ Configuration
In `index.html`:
```javascript
var PRIVY_APP_ID = 'cmu7g5avd00b70cl2qeexjg93';
// Creator wallet receiving all seed & land upgrade purchases
var CREATOR_WALLET = '0x0b127f65d167159e4e2bf0b73c2975a14ac3d056';

```
*Note: Social authentication is handled by Privy. Wallet transfers use Base and require user confirmation plus network gas.*

## 🌾 Game Features
- **Interactive Plots**: 3x3 default grid, expandable to 4x4 (16 plots) and 5x5 (25 plots).
- **Crops & Seeds**: Free daily wheat (10/day) plus reusable premium crops (Sweet Corn, Golden Berry, Celestial Melon, Royal Truffle, Mythic Sunflower, Mythic Dragon Fruit, Cosmic Lotus).
- **Seed Synthesis**: Upgrade harvested crops into higher-tier seeds in the Barn.
- **Mastery & Stamina**: Automatic stamina regeneration (every 3 minutes) and level progression.
- **Rewards & Allocations**: Reward accounting remains disabled for onchain claims until a distributor contract is deployed.
