# MUSEFARM

MUSEFARM is a Harvest Moon-inspired farming game with Privy social login, an embedded wallet, and Base transactions signed directly by the player.

## Runtime

Open the GitHub Pages site. Privy must allow `https://reansky.github.io` and have Google and Twitter enabled as login methods.

Farm progress is stored locally per Privy wallet in the browser. Premium seeds and land expansions use direct USDC transfers from the embedded Privy wallet to the configured creator wallet. Every transaction requires player confirmation and Base gas.

## Features

- X and Google sign-in through Privy.
- Harvest Moon video hero on the login screen.
- 3x3 farm grid with 4x4 and 5x5 land expansions.
- Free Wheat claims, reusable premium seeds, crop harvesting, stamina regeneration, and seed synthesis.
- Local leaderboard and reward-score tracking.

## Configuration

Payment and network constants are defined in `index.html`:

```javascript
var CREATOR_WALLET = '0x0b127f65d167159e4e2bf0b73c2975a14ac3d056';
var BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
```
