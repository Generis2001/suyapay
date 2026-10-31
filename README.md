# SuyaPay

Order Professor Dozzie's suya on Woji Road, pay directly to the stall in USDC on Arc Testnet, and revisit confirmed payments in the **Transaction receipts** tab. Receipts are stored in the browser on the device used for checkout, with item details, totals, wallet addresses, transaction hashes, and explorer links.

The UI takes inspiration from Cowrywise's login page, with flame red accents and the supplied suya artwork as a prominent watermark. Receipts can be downloaded as PNG images from the history list or detail screen. Built with React, TypeScript, Vite, Tailwind CSS, wagmi, viem, and ConnectKit, originally exported from [Arc Studio](https://studio.arc.io).

## Local development

Use Node.js 22.18 or newer (Node 24 is recommended).

```sh
npm ci
cp .env.example .env
```

Set these public frontend values in `.env`:

```dotenv
VITE_MERCHANT_ADDRESS=0x0986Bfd653985c9Fa60a464784264444B542BfD7
VITE_ARC_RPC_URL=https://rpc.testnet.arc.network
```

```sh
npm run dev -- --host 0.0.0.0 --port 5173
```

Open http://localhost:5173. Connect a browser wallet, switch to Arc Testnet (chain ID **5042002**), and fund it using the [Circle faucet](https://faucet.circle.com). Payments transfer the exact menu total; leave additional test USDC for network fees. Menu items and prices live in `src/menu.ts`.

## Checks

```sh
npm test
npm run typecheck
npm run build
npm run contracts:build
```

The receipt tests cover history persistence, duplicate hashes, migration from the original checkout, malformed storage, and storage failures. The frontend typecheck covers `src/`; the original Arc Studio deployment scripts include a private Compass dependency and are preserved separately from the standalone build.

## Arc deployment

Checkout uses the existing USDC contract at `0x3600000000000000000000000000000000000000`, with 6 ERC-20 decimals. It does not need a custom payment contract or token approval.

The included reusable CREATE2 factory is deployed at `0xf4a837f6eab2266eda78eacd4d93a14ab2a665a6`. Its deployment transaction is [viewable on Arc](https://testnet.arcscan.app/tx/0xde3dacf5c409be6f65f6c7ab9d4433324a2236ba5eb3aa64b47347253a511e1e). Deployment information and bytecode checks are recorded in `deployments/arc-testnet.json`.

```sh
npm run arc:deploy
```

This verifies Arc's chain ID, USDC bytecode and decimals, and the recorded factory against the compiled runtime bytecode. On a fresh deployment without a manifest, supply `DEPLOYER_PRIVATE_KEY` through the process environment. The key must never be prefixed with `VITE_`, bundled in the app, or committed.

## Vercel

`vercel.json` configures the Vite build, `npm ci`, the `dist` directory, and SPA routes. Configure the same two public `VITE_` variables in Vercel before deployment. Local testing precedes publishing.
