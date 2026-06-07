# Stock Prediction AI - Quick Reference Guide

## 🚀 5-Minute Setup

```bash
# 1. Clone & Install
git clone https://github.com/yourusername/stock-prediction-ai.git
cd stock-prediction-ai
npm install

# 2. Configure
cp .env.example .env
# Edit .env: Add ANTHROPIC_API_KEY=sk-ant-your-key-here

# 3. Run
npm run dev

# 4. Test (in another terminal)
node client.example.js
```

---

## 📚 File Guide

| File | Purpose | Key Function |
|------|---------|--------------|
| `server.js` | Main Express server | POST /api/analyze |
| `package.json` | Dependencies | npm install |
| `.env.example` | Config template | Copy to .env |
| `client.example.js` | Test client | node client.example.js |
| `marketDataFetcher.js` | Get stock data | MarketDataFetcher.getQuote() |
| `technicalIndicators.js` | Calculate indicators | TechnicalIndicators.rsi() |
| `README.md` | Project overview | Start here |
| `GETTING_STARTED.md` | Setup guide | Detailed instructions |
| `ARCHITECTURE.md` | Diagrams | Visual understanding |

---

## 🔌 API Endpoints

### Single Stock Analysis
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL"}'
```

### Multiple Stocks
```bash
curl -X POST http://localhost:3000/api/analyze-batch \
  -H "Content-Type: application/json" \
  -d '{"symbols":["AAPL","MSFT","GOOGL"]}'
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

---

## 💻 Code Snippets

### Use the API in Your Code
```javascript
import axios from 'axios';

async function getRecommendation(symbol) {
  const response = await axios.post('http://localhost:3000/api/analyze', {
    symbol,
    includeAlavancagem: false
  });
  
  return response.data.recommendation;
}

const rec = await getRecommendation('AAPL');
console.log(`${rec.action} with ${rec.confidence}% confidence`);
```

### Calculate Indicators
```javascript
import { TechnicalIndicators } from './technicalIndicators.js';

const closes = [100, 101, 102, 101, 103, 104, 103, 102, 105, 106];
const rsi = TechnicalIndicators.rsi(closes);
const sma = TechnicalIndicators.sma(closes, 5);

console.log(`RSI: ${rsi}`);      // 0-100
console.log(`SMA5: ${sma}`);     // Simple moving average
```

### Fetch Market Data
```javascript
import { marketDataFetcher } from './marketDataFetcher.js';

const quote = await marketDataFetcher.getQuote('AAPL');
console.log(`Price: $${quote.price}`);
console.log(`Volume: ${quote.volume}`);
```

---

## 🎯 Key Concepts

### Technical Indicators at a Glance

| Name | Range | Signal | Code |
|------|-------|--------|------|
| **RSI** | 0-100 | <30 BUY, >70 SELL | `TechnicalIndicators.rsi(closes)` |
| **MACD** | Any | Crossover = trend | `TechnicalIndicators.macd(closes)` |
| **SMA** | Any | 50>200 = uptrend | `TechnicalIndicators.sma(closes, 50)` |
| **Bollinger** | Any | High/low bands | `TechnicalIndicators.bollingerBands(closes)` |

### Recommendation Scores

```javascript
if (confidence > 80) console.log("STRONG signal - consider trading");
if (confidence > 60) console.log("MODERATE signal - good entry");
if (confidence < 40) console.log("WEAK signal - wait for confirmation");
```

### Risk Levels

```javascript
riskLevel === "LOW"    // Safe, minimal leverage
riskLevel === "MEDIUM" // Moderate, max 2x leverage
riskLevel === "HIGH"   // Risky, avoid leverage
```

---

## 🔧 Configuration

### Environment Variables
```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-...
FINNHUB_API_KEY=...
ALPHA_VANTAGE_API_KEY=...

# Server
PORT=3000
NODE_ENV=development

# Features
ENABLE_LEVERAGE_ANALYSIS=true
```

### Market Data Sources

**Option 1: yfinance (Free)**
```javascript
const fetcher = new MarketDataFetcher("yfinance");
```

**Option 2: Finnhub (Free tier)**
```bash
export FINNHUB_API_KEY=your_key
```

**Option 3: Alpha Vantage (Free tier)**
```bash
export ALPHA_VANTAGE_API_KEY=your_key
```

---

## 🚨 Common Issues

### Issue: API Key Error
```
Error: ANTHROPIC_API_KEY not set
```
**Fix:** Check `.env` file exists and has valid key
```bash
cat .env  # Should show: ANTHROPIC_API_KEY=sk-ant-...
```

### Issue: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Fix:** Kill process on port 3000
```bash
lsof -i :3000
kill -9 <PID>
```

### Issue: Module Not Found
```
Error: Cannot find module '@anthropic-ai/sdk'
```
**Fix:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Network Error
```
Error: Failed to fetch stock data
```
**Fix:** Check internet, verify symbol exists
```bash
# Test API connection
curl https://api.example.com/quote?symbol=AAPL
```

---

## 📈 Common Workflows

### Get Stock Recommendation
```javascript
// 1. Start server
npm run dev

// 2. Call API
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ symbol: 'AAPL' })
});

// 3. Get result
const { recommendation } = await response.json();
console.log(recommendation.action);  // BUY, SELL, or HOLD
```

### Analyze Multiple Stocks
```javascript
const stocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];

const results = await Promise.all(
  stocks.map(symbol => 
    fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol })
    }).then(r => r.json())
  )
);

results.forEach(r => {
  console.log(`${r.symbol}: ${r.recommendation.action}`);
});
```

### Portfolio Analysis
```javascript
const portfolio = ['AAPL', 'MSFT', 'NVDA', 'AMD'];

for (const symbol of portfolio) {
  const rec = await analyzeStock(symbol);
  console.log(`${symbol}: ${rec.action} (${rec.confidence}%)`);
}
```

---

## 🧠 Decision-Making Flow

```
Is RSI < 30?  ──YES──> BULLISH (+)
  │
  NO
  │
  ▼
Is RSI > 70?  ──YES──> BEARISH (-)
  │
  NO
  │
  ▼
Is MACD > Signal?  ──YES──> BULLISH (+)
  │
  NO
  │
  ▼
Is SMA50 > SMA200?  ──YES──> BULLISH (+)
  │
  NO
  │
  ▼
Score Signals  ──MORE BULLISH──> BUY
     │
     └──MORE BEARISH──> SELL
     │
     └──BALANCED──> HOLD
```

---

## 📊 Response Format Explained

```json
{
  "symbol": "AAPL",              // Stock symbol
  "timestamp": "2024-01-15T...",  // When analyzed
  "recommendation": {
    "action": "BUY",              // BUY, SELL, or HOLD
    "confidence": 78,             // 0-100%
    "reasoning": "Strong...",     // Why this recommendation
    "signals": {
      "bullish": [                // Reasons to buy
        "RSI at 65 (bullish zone)",
        "MACD positive crossover",
        "Price above SMA200"
      ],
      "bearish": [                // Reasons to be cautious
        "Near 52-week high",
        "High volatility (ATR=3.5)"
      ]
    },
    "riskLevel": "MEDIUM",        // LOW, MEDIUM, HIGH
    "leverage": {                 // Optional
      "recommended": true,
      "maxLeverage": 2,
      "reasoning": "Strong trend..."
    }
  }
}
```

---

## 🎓 Learning Path

1. **Beginner**: Read README.md + GETTING_STARTED.md
2. **Intermediate**: Study server.js and understand API flow
3. **Advanced**: Review technicalIndicators.js and add your own
4. **Expert**: Implement real market data + database

---

## 🔗 Useful Links

- **Anthropic Claude API**: https://docs.claude.com
- **Finnhub API**: https://finnhub.io/docs/api
- **Technical Analysis**: https://www.investopedia.com/terms/t/technicalanalysis.asp
- **Stock Basics**: https://www.investopedia.com/stocks-4427789
- **Node.js Express**: https://expressjs.com

---

## 💡 Pro Tips

1. **Start with mock data** - Test your system without real API calls
2. **Use paper trading** - Practice with fake money first
3. **Keep logs** - Track all predictions for backtesting
4. **Add alerts** - Get notified when signals appear
5. **Diversify** - Never rely on one indicator
6. **Use stop losses** - Always protect your capital
7. **Test thoroughly** - Backtest before trading real money

---

## ⚠️ Risk Reminder

This is **NOT financial advice**. Always:
- Do your own research (DYOR)
- Start small with investments
- Use stop losses on all trades
- Never invest money you can't lose
- Leverage multiplies both gains AND losses
- Past performance ≠ future results

---

## 🆘 Getting Help

1. Check the error message carefully
2. Review GETTING_STARTED.md
3. Look at code comments
4. Search the documentation
5. Check API provider docs (Finnhub, yfinance)
6. Ask on GitHub Issues

---

**Happy coding! 🚀📈**
