# MUSEFARM 🌾

**MUSEFARM** is a standalone Web3 farming game designed to run on any web hosting (Vercel, Netlify, Cloudflare Pages, GitHub Pages) with direct onchain payments to the creator wallet and non-custodial wallet access.

## 🌟 Key Architecture Changes
- **Wallet Connection**: Supports a locally generated guest wallet and standard **Web3 wallets** (MetaMask, Rabby, Coinbase Wallet, Injected EIP-1193). Email login is not used.
- **Wallet Menu**: The Wallet tab shows Base ETH/USDC balances, provides a deposit address, and supports confirmed ETH/USDC withdrawals to a validated destination address.
- **Direct Payment Routing**: When players purchase premium seeds or expand land territory, payments settle directly onchain to the creator wallet:
  `0x0b127f65d167159e4e2bf0b73c2975a14ac3d056` via USDC on Base (contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) with ETH fallback.
- **Standalone Game Engine**: Game state (plots, planted crops, growth timers, barn storage, stamina, and leveling) runs client-side and automatically persists to `localStorage` per connected wallet address.

## 🚀 How to Deploy as a Public Website

### Option 1: Vercel / Netlify / Cloudflare Pages
1. Fork or push this repository to your GitHub.
2. Import the repository into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Set build settings to static (root folder, no build command needed).
4. Deploy — your site will be live on your custom domain or `*.vercel.app`.

### Option 2: GitHub Pages
1. Go to repository **Settings** > **Pages**.
2. Select branch `main` and root `/`.
3. Click **Save** — site is instantly available at `https://reansky.github.io/musefarm/`.

## ⚙️ Configuration
In `index.html`:
```javascript
// Creator wallet receiving all seed & land upgrade purchases
var CREATOR_WALLET = '0x0b127f65d167159e4e2bf0b73c2975a14ac3d056';

```
*Note: Players can connect with MetaMask, Rabby, Coinbase Wallet, or create a guest wallet. Wallet transfers use Base and require transaction confirmation plus network gas.*

## 🌾 Game Features
- **Interactive Plots**: 3x3 default grid, expandable to 4x4 (16 plots) and 5x5 (25 plots).
- **Crops & Seeds**: Free daily wheat (10/day) plus reusable premium crops (Sweet Corn, Golden Berry, Celestial Melon, Royal Truffle, Mythic Sunflower, Mythic Dragon Fruit, Cosmic Lotus).
- **Seed Synthesis**: Upgrade harvested crops into higher-tier seeds in the Barn.
- **Mastery & Stamina**: Automatic stamina regeneration (every 3 minutes) and level progression.
- **Rewards & Allocations**: 1 MUSE harvested = 2 $MUSEFARM token allocation.
