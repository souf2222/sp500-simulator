# S&P 500 Trading Simulator

A React application to simulate and test ranking-based trading strategies on S&P 500 stocks.

## Features

- **Two Trading Strategies**:
  1. **Rank-Based Strategy**: Buy when a stock reaches rank X, sell when it drops to rank Y
  2. **Rank Change Strategy**: Buy when a stock moves from position X to position Y, sell when it drops Z positions

- **Real-time Simulation**: 5 years of simulated S&P 500 data
- **Performance Comparison**: Compare your strategy against S&P 500 benchmark
- **Interactive Charts**: Visualize portfolio value over time

## Getting Started

```bash
cd sp500-simulator
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## How It Works

### Strategy 1: Buy at Rank, Sell at Rank
- Set "Buy when rank ≤ X" to choose the rank to buy
- Set "Sell when rank = Y" to choose when to sell

### Strategy 2: Rank Change
- Enable "Use Rank Change Strategy"
- Set "Buy when: Rank X → Y" to buy when a stock moves from position X to Y
- Set "Sell when drops Z position(s)" to define exit condition

## Tech Stack

- React + Vite
- Recharts for data visualization
- Simulated stock data (5 years)
