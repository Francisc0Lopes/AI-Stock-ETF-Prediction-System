# AI Stock & ETF Prediction System

An intelligent system that uses AI to analyze market data and provide buy/sell recommendations for stocks, ETFs, and leveraged instruments (alavancagem).

## 🎯 Project Overview

This project leverages the **Anthropic Claude API** to process market data and deliver actionable investment insights. The system analyzes historical price data, technical indicators, and market sentiment to generate predictions.

### Key Features
- ✅ Real-time stock/ETF data fetching
- ✅ Technical analysis (moving averages, RSI, MACD, Bollinger Bands)
- ✅ AI-powered sentiment analysis and pattern recognition
- ✅ Buy/Sell/Hold recommendations with confidence levels
- ✅ Leveraged instrument (alavancagem) risk assessment
- ✅ Portfolio tracking and alerts
- ✅ Historical backtesting

---

## 🏗️ Architecture

### Tech Stack

```
┌─────────────────────────────────────────┐
│   Frontend (Optional: React/Vue)        │
│   - Dashboard with recommendations      │
│   - Real-time alerts                    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│   Backend API (Node.js/Python)          │
│   - Express/FastAPI server              │
│   - Claude API integration              │
│   - Data processing pipeline            │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│   Data Layer                            │
│   - Market data API (yfinance, etc)     │
│   - Database (PostgreSQL/MongoDB)       │
│   - Cache (Redis)                       │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│   Anthropic Claude API                  │
│   - Pattern recognition                 │
│   - Market analysis                     │
│   - Recommendation generation           │
└─────────────────────────────────────────┘
```

### Component Breakdown

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Data Fetcher** | Collect market data | yfinance, Alpha Vantage |
| **Technical Analyzer** | Calculate indicators | TA-Lib, pandas |
| **AI Engine** | Generate predictions | Anthropic Claude API |
| **API Server** | Expose endpoints | Node.js (Express) or Python (FastAPI) |
| **Database** | Store results & history | PostgreSQL |
| **Cache Layer** | Reduce API calls | Redis |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Python 3.10+
- Anthropic API key: https://console.anthropic.com
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/stock-prediction-ai.git
cd stock-prediction-ai

# Install dependencies (Node.js example)
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys:
# ANTHROPIC_API_KEY=sk-ant-...
# FINNHUB_API_KEY=...  (or your data provider)
```

### Quick Start

```bash
# Start the server
npm run dev

# API will be available at http://localhost:3000
```

---

## 📊 How It Works

### 1. **Data Collection**
```
Market Data → Fetch (yfinance) → Store in DB → Cache for quick access
```

### 2. **Technical Analysis**
```
Historical Data → Calculate Indicators (RSI, MACD, MA) → Feature Engineering
```

### 3. **AI Analysis (Claude)**
```
Market Data + Technical Indicators → Claude API → Pattern Recognition & Sentiment
```

### 4. **Recommendation Generation**
```
AI Analysis → Create Decision Logic → Generate Buy/Sell/Hold with Confidence Score
```

---

## 🔧 Language & Framework Choice

### **Recommended: Node.js + TypeScript**
**Why?**
- Fast API server with Express
- Real-time capabilities with WebSockets
- Easy frontend integration
- Large ecosystem for financial data

### Alternative: Python
**Why?**
- Excellent data science libraries (pandas, NumPy)
- Better for complex ML models later
- Easy integration with financial APIs

**Choose Node.js if:** You want a full-stack solution with a polished API
**Choose Python if:** You focus on data science and model complexity

---

## 📝 API Endpoints

```
POST /api/analyze
- Input: { symbol, period, includeAlavancagem }
- Output: { recommendation, confidence, reasoning, signals }

GET /api/portfolio
- Returns: Portfolio analysis and alerts

POST /api/alert
- Input: { symbol, condition, threshold }
- Output: Alert created with ID

GET /api/history/:symbol
- Returns: Historical recommendations and accuracy
```

---

## ⚠️ Disclaimer

**This is an educational tool, not financial advice.**

- Always conduct your own due diligence
- Start with small positions
- Use stop losses on leveraged instruments
- Consult a financial advisor
- Past performance ≠ future results

---

## 🛣️ Roadmap

- [ ] Phase 1: Core analysis engine (weeks 1-2)
- [ ] Phase 2: Claude API integration (weeks 2-3)
- [ ] Phase 3: Database & caching (week 3)
- [ ] Phase 4: Web dashboard (weeks 4-5)
- [ ] Phase 5: Mobile app & alerts
- [ ] Phase 6: Backtesting framework
- [ ] Phase 7: Multi-strategy support

---

## 📚 Resources

- [Anthropic Claude API Docs](https://docs.claude.com)
- [yfinance Documentation](https://yfinance.readthedocs.io/)
- [TA-Lib](https://ta-lib.org/)
- [Technical Analysis Indicators](https://en.wikipedia.org/wiki/Technical_analysis)

---

## 📄 License

MIT - See LICENSE file for details