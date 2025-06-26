# 🧪 Interact ABI Tool

**Interact ABI Tool** is a developer-friendly web application that allows users to load and interact with any Ethereum smart contract by uploading or pasting the contract's ABI and specifying the contract address. It offers a clean UI for calling both read (view) and write (state-changing) functions without writing a single line of code.

---

## ✨ Features

- 🔍 Load ABI (JSON format) via file upload or paste
- 🏷 Auto-detect and list all available functions (read & write)
- 📥 Input generator for function parameters
- 📤 Execute functions directly from the UI
- 🔒 MetaMask wallet connection for transaction signing
- 📊 Display results or transaction hash instantly
- 📜 Contract ABI parsing & dynamic rendering
- ☁️ Clean and minimal UI built with Tailwind CSS + ShadCN
- ⚙️ Built with **React**, **Vite**, **ethers.js**, **TypeScript**

---

## 🖥 Demo

🔗 [Live App](https://interact-abi-tool.netlify.app)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:Ajay-Dhore/interact-abi-tool.git
cd interact-abi-tool
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Sample ERC20 ABI (for testing)

<details>
  <summary>Sample ERC20 ABI</summary>

```json
[
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function",
    "stateMutability": "view"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function",
    "stateMutability": "nonpayable"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function",
    "stateMutability": "view"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_from", "type": "address" },
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function",
    "stateMutability": "nonpayable"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function",
    "stateMutability": "view"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function",
    "stateMutability": "view"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function",
    "stateMutability": "nonpayable"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function",
    "stateMutability": "view"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "type": "function",
    "stateMutability": "view"
  },
  {
    "inputs": [
      { "name": "_initialSupply", "type": "uint256" },
      { "name": "_tokenName", "type": "string" },
      { "name": "_decimalUnits", "type": "uint8" },
      { "name": "_tokenSymbol", "type": "string" }
    ],
    "type": "constructor",
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      { "indexed": true, "name": "_from", "type": "address" },
      { "indexed": true, "name": "_to", "type": "address" },
      { "indexed": false, "name": "_value", "type": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      { "indexed": true, "name": "_owner", "type": "address" },
      { "indexed": true, "name": "_spender", "type": "address" },
      { "indexed": false, "name": "_value", "type": "uint256" }
    ],
    "anonymous": false
  },
  {
    "constant": false,
    "inputs": [
      { "name": "account", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "type": "function",
    "stateMutability": "nonpayable"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "amount", "type": "uint256" }
    ],
    "name": "burn",
    "outputs": [],
    "type": "function",
    "stateMutability": "nonpayable"
  }
]
```

</details>

---

## 🧑‍💻 Author

**Ajay Dhore**  
Head of Integration | Blockchain & Full-Stack Developer  
[GitHub](https://github.com/Ajay-Dhore) • [LinkedIn](https://www.linkedin.com/in/ajay-dhore-09aa7518b)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 💡 Future Improvements

- ABI validation and error highlighting
- Function input/output formatting (based on types)
- Support for ENS domains
- Support for gas estimation and fee overrides
- Export function call results

---

> Built with 💙 to simplify smart contract interaction for developers and power users.
