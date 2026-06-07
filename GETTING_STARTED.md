# Stock Prediction AI - Getting Started Guide

## 📋 Overview

This guide walks you through setting up and using the AI-powered stock prediction system. The system uses **Anthropic Claude API** to analyze market data and provide buy/sell recommendations.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get an Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy it (keep it safe!)

### Step 2: Clone & Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/stock-prediction-ai.git
cd stock-prediction-ai

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API key
# ANTHROPIC_API_KEY=sk-ant-your-key-here
nano .env  # or use your favorite editor
```

### Step 3: Run the Server
```bash
npm run dev
```

You should see:
```
🚀 Stock Prediction AI Server running on http://localhost:3000
📊 POST /api/analyze to get stock recommendations
📈 POST /api/analyze-batch for multiple stocks
❤️  GET /api/health to check server status
```

### Step 4: Test It
```bash
# In a new terminal, run the example client
node client.example.js
```

---

## 🔧 Architecture Explained

### Core Components

#### 1. **Express Server** (`server.js`)
- Runs on port 3000
- Handles HTTP requests from clients
- Routes requests to analysis engine

#### 2. **Claude API Integration**
- Sends market data to Claude
- Gets AI-powered analysis back
- Formats recommendations

#### 3. **Market Data Fetcher** (`marketDataFetcher.js`)
- Fetches real-time stock prices
- Supports: yfinance, Finnhub, Alpha Vantage
- Returns structured data

#### 4. **Technical Indicators** (`technicalIndicators.js`)
- Calculates RSI, MACD, Moving Averages
- Identifies trading signals
- Computes volatility (ATR)

---

## 📊 How It Works

### Analysis Flow

```
User Request (POST /api/analyze?symbol=AAPL)
        ↓
Fetch Market Data (from yfinance/Finnhub)
        ↓
Calculate Technical Indicators (RSI, MACD, SMA)
        ↓
Prepare Analysis Prompt
        ↓
Send to Claude API with Prompt
        ↓
Claude Analyzes Data & Generates Recommendation
        ↓
Parse Claude Response (JSON)
        ↓
Return to User with BUY/SELL/HOLD Signal
```

---

## 💡 Code Explanation

### How Claude is Called

```javascript
const message = await anthropic.messages.create({
  model: "claude-opus-4-6",  // Latest Claude model
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: analysisPrompt,  // Contains market data + technical indicators
    },
  ],
});
```

**What Claude Does:**
1. Reads the market data (price, volume, P/E ratio, etc.)
2. Reviews technical indicators (RSI, MACD, moving averages)
3. Identifies bullish/bearish signals
4. Generates a recommendation with reasoning

### Key Technical Indicators Explained

| Indicator | What It Means | Buy Signal | Sell Signal |
|-----------|---------------|-----------|------------|
| **RSI** | Momentum (0-100) | <30 (oversold) | >70 (overbought) |
| **MACD** | Trend direction | MACD > Signal Line | MACD < Signal Line |
| **SMA 50/200** | Trend strength | 50 above 200 = uptrend | 50 below 200 = downtrend |
| **Bollinger Bands** | Volatility support/resistance | Price near lower band | Price near upper band |
| **ATR** | Volatility measure | Low ATR = stable | High ATR = volatile |

---

## 🔌 API Endpoints

### 1. Analyze Single Stock
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "includeAlavancagem": false
  }'
```

**Response:**
```json
{
  "symbol": "AAPL",
  "timestamp": "2024-01-15T10:30:00Z",
  "recommendation": {
    "action": "BUY",
    "confidence": 78,
    "reasoning": "Strong momentum with RSI at 65...",
    "signals": {
      "bullish": ["RSI in bullish zone", "MACD crossover"],
      "bearish": ["Price near 52-week high"]
    },
    "riskLevel": "MEDIUM"
  }
}
```

### 2. Analyze Multiple Stocks
```bash
curl -X POST http://localhost:3000/api/analyze-batch \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["AAPL", "MSFT", "GOOGL"],
    "includeAlavancagem": false
  }'
```

### 3. Health Check
```bash
curl http://localhost:3000/api/health
```

---

## 🎓 Understanding the Response

### Example Response Breakdown

```json
{
  "action": "BUY",        ← Action to take
  "confidence": 82,        ← Confidence level 0-100%
  "reasoning": "...",      ← Why this recommendation
  "signals": {
    "bullish": [           ← Reasons to buy
      "RSI at 65 shows strong momentum",
      "MACD positive crossover",
      "Price above SMA200"
    ],
    "bearish": [           ← Reasons to be cautious
      "Approaching 52-week high",
      "High volatility"
    ]
  },
  "riskLevel": "MEDIUM",   ← Risk assessment
  "leverage": {
    "recommended": true,
    "maxLeverage": 2,
    "reasoning": "..."
  }
}
```

---

## 🔄 Using Real Market Data

Currently, the system uses **mock data**. To use real data:

### Option 1: yfinance (Python)
```python
import yfinance as yf
data = yf.download('AAPL', period='1y')
```

Create a Python service and call it from Node.js:
```bash
pip install yfinance
python3 data_server.py  # Runs on port 5000
```

### Option 2: Finnhub API (Recommended)
```bash
# Get free API key: https://finnhub.io
export FINNHUB_API_KEY=your_key_here
```

Then update `marketDataFetcher.js` line 41:
```javascript
const fetcher = new MarketDataFetcher("finnhub");
```

### Option 3: Alpha Vantage
```bash
export ALPHA_VANTAGE_API_KEY=your_key_here
```

---

## 📈 Next Steps (Building Phase 2)

### Add Real Market Data
```javascript
// Replace mock data in server.js with:
const { marketDataFetcher } = require('./marketDataFetcher.js');
const marketData = await marketDataFetcher.getQuote('AAPL');
```

### Add Historical Data for Indicators
```javascript
const historicalData = await marketDataFetcher.getHistoricalData('AAPL', 200);
const indicators = TechnicalIndicators.calculateAll(historicalData);
```

### Add Database Storage
```javascript
// Save recommendations to PostgreSQL
await db.query(
  'INSERT INTO recommendations (symbol, action, confidence, created_at) VALUES ($1, $2, $3, NOW())',
  [symbol, action, confidence]
);
```

---

## 🚨 Important: Risk Management

⚠️ **This is NOT financial advice!**

- Always do your own research
- Use stop losses on all trades
- Start small with paper trading
- Never invest money you can't afford to lose
- Leverage multiplies both gains AND losses

### Leverage (Alavancagem) Safety

If the system recommends leverage:
- **2x leverage**: Safe only with strong signals
- **3x+ leverage**: Only for experienced traders
- **Daily leveraged ETFs**: Use for short-term trading only

---

## 🐛 Troubleshooting

### API Key Error
```
Error: ANTHROPIC_API_KEY not set
```
✅ Solution: Check your `.env` file has the correct key

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Claude API error
```
Error: 401 Unauthorized
```
✅ Solution: Verify your API key is valid at https://console.anthropic.com

### No market data
```
Error: Failed to fetch stock data
```
✅ Solution: 
1. Check your internet connection
2. Verify the stock symbol (e.g., AAPL, not "Apple")
3. Add API key for your data provider

---

## 📚 Useful Resources

- [Claude API Docs](https://docs.claude.com)
- [Finnhub API](https://finnhub.io/docs/api)
- [Technical Analysis Guide](https://www.investopedia.com/terms/t/technicalanalysis.asp)
- [Stock Market Basics](https://www.investopedia.com/stocks-4427789)

---

## 🤝 Contributing

Contributions welcome! Areas to help:

- [ ] Add more indicators (Stochastic, Williams %R)
- [ ] Build React dashboard
- [ ] Add backtesting engine
- [ ] Support crypto assets
- [ ] Add real-time WebSocket updates

---

## 📝 License

MIT - Use freely for learning and personal projects.

---

**Happy investing! 🚀**
