# FlappySol - Solana Blockchain Game

This project is a Flappy Bird-style game built with React that integrates with the Solana blockchain to store high scores using an on-chain smart contract written in Rust and deployed with Anchor.

---

## 1. Tech Stack Overview

### Frontend (React + Solana Wallet Integration)

* **React** – JavaScript library for building UIs
* **@solana/web3.js** – Solana’s JS API for interacting with the blockchain
* **@solana/wallet-adapter-react** – React hooks and context for wallet connection
* **@solana/wallet-adapter-wallets** – Provides wallet implementations (Solflare, Phantom, etc.)
* **@solana/wallet-adapter-react-ui** – Prebuilt UI components for wallet connection
* **@solana/wallet-adapter-solflare** – Solflare wallet adapter
* **borsh** – Binary serialization for Rust/JS interoperability
* **buffer, process, stream-browserify** – Polyfills for Node.js modules in browser
* **ajv, ajv-keywords** – JSON schema validation
* **react-app-rewired** – Customize Create React App config without ejecting

### Solana Smart Contracts (Programs)

* **Rust** – Programming language for Solana smart contracts
* **Cargo** – Rust’s package manager
* **Anchor** – Framework for Solana smart contract development

---

## 2. Frontend Installation (Node.js + React)

Make sure you have Node.js and npm installed. In the project root, run:

```bash
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui @solana/wallet-adapter-solflare borsh buffer
npm install --save-dev @babel/plugin-proposal-private-property-in-object buffer process stream-browserify
npm install --save-dev react-app-rewired
npm install ajv@8.12.0 ajv-keywords@5.1.0 --save-dev --legacy-peer-deps
```

### Start the development server:

```bash
npm start
```

---

## 3. Solana, Rust, Cargo, and Anchor Setup

### A. Install Rust & Cargo

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Restart your terminal and verify:

```bash
rustc --version
cargo --version
```

(Optional) Update Rust:

```bash
rustup update
```

### B. Install Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.20/install)"
```

After installation, add Solana CLI to your PATH if needed. Then verify:

```bash
solana --version
```

### C. Install Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

Verify installation:

```bash
anchor --version
```

### D. Additional Requirements

* Node.js (Already installed)
* Yarn (optional)

---

## 4. Building and Deploying Solana Programs

### A. Using Anchor Locally

**Build the Program:**

```bash
anchor build
```

**Test the Program:**

```bash
anchor test
```

**Deploy to Localnet:**

```bash
solana-test-validator
anchor deploy
```

**Deploy to Devnet:**

```bash
solana config set --url devnet
anchor deploy
```

After deploying, copy your program IDL:

```bash
cp target/idl/flappy_sol.json frontend/src/idl.json
```

### B. Using Solana Playground

You can also build and deploy programs in-browser using:

* [https://solanaplayground.com](https://solanaplayground.com)
* [https://fiddle.shyft.to](https://fiddle.shyft.to)

These tools are great for testing and learning. For full projects, Anchor CLI is preferred.


---

## 6. Running the Full App

1. Start Solana local validator (optional for local testing):

   ```bash
   solana-test-validator
   ```

2. Deploy your program locally:

   ```bash
   anchor build && anchor deploy
   ```

3. Start your frontend app:

   ```bash
   cd frontend
   npm start
   ```
