# 💸 Expense Tracker - Premium Wealth Management & Analytics Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-emerald.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node%20%7C%20Express-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

A high-performance, responsive wealth-tracking dashboard built on the MERN stack. Designed with a gorgeous, off-white glassmorphic visual system and optimized with native MongoDB aggregate pipeline calculations. It enables users to seamlessly manage transactions, monitor category budgets with color-coded warning systems, and visualize wealth growth curves.

---

## ✨ Features

### 🎨 Premium UI/UX Design System
- **White Glassmorphism Theme**: A premium, clean off-white (`#f8fafc`) palette using custom backdrop-filters, subtle borders, and smooth radial emerald gradients.
- **Micro-Animations & Responsive Layouts**: Built from the ground up to be fully mobile-responsive using fluid Flexbox/Grid structures, smooth state transitions, hover scale effects, and custom animated scrollbars.
- **Dynamic Routing & Auth Hooks**: React Router setup with protected route boundaries and immediate session updates upon sign-up or log-in.

### 📊 Real-Time Analytics & Data Visualization
- **Interactive Recharts Engines**:
  - **Category Donut Chart**: Breaks down expenditure shares dynamically, rendering relative percentages and total spends.
  - **Monthly Expenditure Bar Chart**: Uses emerald-to-forest gradients to map monthly spending patterns.
  - **Cumulative Net Worth Progression**: Renders smooth area curves illustrating wealth accumulation curves.
  - **Cash Flow Area Chart**: Renders overlapping curves comparing income vs. expenses side-by-side.

### ⚙️ Feature-Rich Core Modules
- **Interactive Transactions Ledger**: Supports pagination, query-debounced text search, category filters, and date-range constraints. Features complete CRUD operations managed through clean modal overlays.
- **Proactive Budget Manager**: Displays real-time progress bars comparing category spending against monthly caps. Color indicators shift from **Green** to **Yellow (80%)** and **Red (100%+)** to instantly alert users.
- **Developer Database Seeder**: Integrates an instant seeding utility in account settings, generating 6 months of realistic historical data (rent, salary, utilities, grocery items, entertainment) to populate charts immediately.
- **Aggregated Backend Service**: Powered by optimized MongoDB aggregate pipelines to run complex analytics directly inside the database cluster rather than relying on heavy in-memory JavaScript mappings.

---

## 🛠️ Tech Stack & Key Libraries

### Frontend
- **React.js** (Functional components, hooks, custom contexts)
- **Tailwind CSS** (Utility-first styling with custom glassmorphic properties)
- **Recharts** (Declarative SVG charts)
- **React Icons** (Modern iconography)
- **React Hot Toast** (Polished notifications)
- **Axios** (Promise-based HTTP client)

### Backend
- **Node.js** & **Express.js** (RESTful API architecture)
- **MongoDB** & **Mongoose** (Document database with custom aggregation pipelines)
- **JSON Web Tokens (JWT)** (Secure stateless authentication)
- **Bcrypt.js** (Salted password hashing)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local instance or MongoDB Atlas cluster URI)

### Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```

2. **Configure the Backend Service:**
   ```bash
   cd server
   # Create environment configuration file
   cp .env.example .env
   ```
   Open the newly created `.env` file and input your secrets:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://your_connection_string
   JWT_SECRET=your_jwt_signature_key
   ```
   Install dependencies and run the server:
   ```bash
   npm install
   npm run dev
   ```

3. **Configure the Frontend Client:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
expense-tracker/
├── client/                 # React Frontend Client
│   ├── src/
│   │   ├── components/     # Reusable layout blocks (Navbar, Charts, SummaryCards)
│   │   ├── context/        # Global AuthContext & hooks
│   │   ├── pages/          # Page layouts (Dashboard, Budget, Analytics, etc.)
│   │   ├── services/       # Axios API client setups
│   │   ├── App.jsx         # App router configurations
│   │   └── index.css       # Global styling & Tailwind theme variables
│   └── package.json
└── server/                 # Express API Backend
    ├── src/
    │   ├── config/         # MongoDB connections & configs
    │   ├── models/         # Mongoose schema definitions
    │   ├── routes/         # REST API routes (auth, transactions, budgets)
    │   └── index.js        # Entry point for backend
    └── package.json
```

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
