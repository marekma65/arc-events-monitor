# Arc Events Monitor

A real-time explorer and toolkit for Arc Testnet. Built by **wija** while exploring the Arc blockchain ecosystem.

## What it does

- 📡 **Live Feed** — Real-time transaction feed showing latest blocks and transfers on Arc Testnet
- ⛽ **Gas Calculator** — Compare transaction costs between Arc and Ethereum. See how much you save.
- 👛 **Wallet Checker** — Check any wallet's USDC and EURC balances on Arc Testnet
- 📤 **Batch Sender** — Send USDC to multiple addresses at once using a simple CSV format
- 🔍 **Tx Decoder** — Decode any Arc transaction and understand what happened in plain English

## Built with

- [Next.js](https://nextjs.org/)
- [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Arc Testnet](https://docs.arc.network/)

## Getting started

1. Clone the repo
```bash
   git clone https://github.com/marekma65/arc-events-monitor.git
   cd arc-events-monitor
```

2. Install dependencies
```bash
   npm install
```

3. Add your WalletConnect Project ID in `lib/wagmi-config.ts`
```ts
   projectId: "YOUR_PROJECT_ID"
```

4. Run the app
```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Live demo

[arc-events-monitor.vercel.app](https://arc-events-monitor.vercel.app)

## Network

Arc Testnet — Chain ID: 5042002 — Explorer: [testnet.arcscan.app](https://testnet.arcscan.app)

## Notes

- No backend required — reads directly from Arc RPC
- No private keys needed for Live Feed, Gas Calculator, Wallet Checker and Tx Decoder
- Batch Sender requires a connected wallet
- Get free testnet USDC from [Circle Faucet](https://faucet.circle.com/)