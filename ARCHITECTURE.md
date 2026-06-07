# Stock Prediction AI - Architecture & Workflow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER/CLIENT LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ CLI/Terminal │  │   Web App    │  │  Mobile App  │           │
│  │  client.js   │  │  React/Vue   │  │  React Native│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└────────────────────────┬──────────────────────────────────────────┘
                         │ HTTP/JSON
┌────────────────────────▼──────────────────────────────────────────┐
│                    API SERVER LAYER                               │
│                   (server.js - Express)                           │
│                                                                   │
│  ┌─ POST /api/analyze ────────────────────────────────────┐      │
│  │  - Receives: { symbol, includeAlavancagem }            │      │
│  │  - Returns: { action, confidence, reasoning, signals } │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                   │
│  ┌─ POST /api/analyze-batch ──────────────────────────────┐      │
│  │  - Batch analyze multiple symbols                      │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                   │
│  ┌─ GET /api/health ──────────────────────────────────────┐      │
│  │  - Server status check                                 │      │
│  └─────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
           │                          │                    │
           ▼                          ▼                    ▼
    ┌──────────────┐         ┌──────────────┐      ┌──────────────┐
    │ Market Data  │         │ Technical    │      │   Claude     │
    │ Fetcher      │         │ Indicators   │      │   API Call   │
    │              │         │              │      │              │
    │ Gets: price, │         │ Calculates:  │      │ Input:       │
    │ volume, P/E, │         │ ├─ RSI       │      │ Market data  │
    │ etc.         │         │ ├─ MACD      │      │ Indicators   │
    │              │         │ ├─ SMA       │      │              │
    │ From:        │         │ ├─ Bollinger │      │ Output:      │
    │ yfinance     │         │ ├─ ATR       │      │ Analysis     │
    │ Finnhub      │         │ └─ ADX       │      │ & signals    │
    │ Alpha Vantage│         │              │      │              │
    └──────────────┘         └──────────────┘      └──────────────┘
         │ Stock data              │ Indicator              │ JSON
         │ (price, volume)         │ values                 │ response
         │                         │                       │
         └─────────────┬───────────┴─────────────────┬────┘
                       │                             │
                       ▼ Combine all data            ▼
          ┌─────────────────────────────────────────────────┐
          │  Analysis Engine                                │
          │  - Merge market data + indicators               │
          │  - Create detailed prompt for Claude            │
          │  - Send to Anthropic Claude API                 │
          │  - Parse AI response                            │
          │  - Format recommendation                        │
          └─────────────────────────────────────────────────┘
                            │
                            ▼
          ┌─────────────────────────────────────────────────┐
          │  Recommendation Output                          │
          │  ├─ Action: BUY / SELL / HOLD                   │
          │  ├─ Confidence: 0-100%                          │
          │  ├─ Risk Level: LOW / MEDIUM / HIGH             │
          │  ├─ Bullish Signals: [list]                     │
          │  ├─ Bearish Signals: [list]                     │
          │  └─ Leverage: { recommended, maxLeverage }      │
          └─────────────────────────────────────────────────┘
```

---

## 🔄 Request-Response Flow

```
CLIENT REQUEST:
┌─────────────────────────────────────────┐
│  POST /api/analyze                      │
│  {                                      │
│    "symbol": "AAPL",                    │
│    "includeAlavancagem": false          │
│  }                                      │
└─────────────────────────────────────────┘
              ▼
      ┌──────────────────┐
      │ Parse Request    │
      └──────────────────┘
              ▼
      ┌──────────────────────────────────────────┐
      │ 1. Fetch Market Data                     │
      │    - Current price: $150.25              │
      │    - Day change: +2.5%                   │
      │    - Volume: 5.2M                        │
      │    - P/E: 24.5                           │
      │    - 52-week range: $124-$185            │
      └──────────────────────────────────────────┘
              ▼
      ┌──────────────────────────────────────────┐
      │ 2. Calculate Technical Indicators        │
      │    - RSI: 65.2 (bullish)                 │
      │    - MACD: 2.45 (positive)               │
      │    - SMA50: $148.5 (above price)         │
      │    - SMA200: $142.3 (uptrend)            │
      │    - Bollinger: $134-$165                │
      │    - ATR: 3.5 (moderate volatility)      │
      └──────────────────────────────────────────┘
              ▼
      ┌──────────────────────────────────────────┐
      │ 3. Create Claude Analysis Prompt         │
      │    "You are a financial expert...        │
      │     Analyze this market data...          │
      │     Consider RSI, MACD, SMA, etc...      │
      │     Recommend: BUY/SELL/HOLD             │
      │     With confidence level..."            │
      └──────────────────────────────────────────┘
              ▼
      ┌──────────────────────────────────────────┐
      │ 4. Call Claude API                       │
      │    anthropic.messages.create({           │
      │      model: "claude-opus-4-6",           │
      │      messages: [prompt]                  │
      │    })                                    │
      └──────────────────────────────────────────┘
              ▼
      ┌──────────────────────────────────────────┐
      │ 5. Claude Analyzes Data                  │
      │    - Reads all indicators                │
      │    - Checks for patterns                 │
      │    - Identifies signals                  │
      │    - Generates reasoning                 │
      │    - Returns JSON response               │
      └──────────────────────────────────────────┘
              ▼
      ┌──────────────────────────────────────────┐
      │ 6. Parse Claude Response                 │
      │    {                                     │
      │      "action": "BUY",                    │
      │      "confidence": 78,                   │
      │      "reasoning": "Strong momentum...",  │
      │      "bullish_signals": [...],           │
      │      "bearish_signals": [...]            │
      │    }                                     │
      └──────────────────────────────────────────┘
              ▼
SERVER RESPONSE:
┌─────────────────────────────────────────┐
│  {                                      │
│    "symbol": "AAPL",                    │
│    "timestamp": "2024-01-15T10:30:00Z", │
│    "recommendation": {                  │
│      "action": "BUY",                   │
│      "confidence": 78,                  │
│      "reasoning": "...",                │
│      "signals": {                       │
│        "bullish": [...],                │
│        "bearish": [...]                 │
│      },                                 │
│      "riskLevel": "MEDIUM"              │
│    }                                    │
│  }                                      │
└─────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  INPUT: Stock Symbol                        │
│                      (e.g., "AAPL")                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │    Market Data Layer                 │
        │  (marketDataFetcher.js)              │
        └──────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐          ┌─────────┐
    │yfinance │          │ Finnhub │          │ Alpha   │
    │         │          │         │          │ Vantage │
    └─────────┘          └─────────┘          └─────────┘
         │                    │                    │
         └────────┬───────────┴────────┬──────────┘
                  │                    │
                  ▼                    ▼
        ┌──────────────────────────────────────┐
        │  Market Data (OHLCV)                 │
        │  ├─ Open: 148.50                     │
        │  ├─ High: 152.30                     │
        │  ├─ Low:  148.00                     │
        │  ├─ Close: 150.25                    │
        │  └─ Volume: 5,200,000                │
        │                                      │
        │  Plus:                               │
        │  ├─ P/E Ratio: 24.5                  │
        │  ├─ Market Cap: $2.1T                │
        │  └─ 52-week High/Low: $185 / $124    │
        └──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │  Technical Indicators Layer          │
        │  (technicalIndicators.js)            │
        └──────────────────────────────────────┘
         │            │             │             │
         ▼            ▼             ▼             ▼
    ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐
    │  RSI   │  │  MACD  │  │ Moving │  │ Bollinger│
    │ 65.2   │  │ 2.45   │  │Averages│  │ Bands    │
    │        │  │ Signal:│  │        │  │          │
    │Bullish │  │ 2.10   │  │SMA20   │  │Upper:165 │
    │ zone   │  │        │  │SMA50   │  │Mid: 150  │
    │(>70=OB)│  │Positive│  │SMA200  │  │Low:  135 │
    │(<30=OS)│  │line    │  │Uptrend │  │Volatility│
    └────────┘  └────────┘  └────────┘  └──────────┘
         │            │             │             │
         └────────┬───┴─────┬───────┴─────┬──────┘
                  │         │             │
                  ▼         ▼             ▼
    ┌──────────────────────────────────────┐
    │  Feature Engineering                 │
    │  Combine all indicators into one     │
    │  feature vector for analysis         │
    └──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │  Claude API Call                     │
    │  Input: All market data + indicators │
    │         Prompt: "Analyze and rec..." │
    │  Output: JSON with recommendation    │
    └──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │  OUTPUT: Recommendation              │
    │  ├─ Action: BUY/SELL/HOLD            │
    │  ├─ Confidence: 0-100%               │
    │  ├─ Reasoning: detailed explanation  │
    │  ├─ Signals: bullish/bearish list    │
    │  └─ Risk: LOW/MEDIUM/HIGH            │
    └──────────────────────────────────────┘
```

---

## 🎯 Decision Tree Example

```
START: Analyzing AAPL
│
├─ RSI Check
│  ├─ If RSI < 30 ──→ OVERSOLD ──→ Bullish signal
│  ├─ If 30 < RSI < 70 ──→ NEUTRAL
│  └─ If RSI > 70 ──→ OVERBOUGHT ──→ Bearish signal
│
├─ MACD Check
│  ├─ If MACD > Signal ──→ Bullish momentum
│  └─ If MACD < Signal ──→ Bearish momentum
│
├─ Moving Average Check
│  ├─ If SMA50 > SMA200 ──→ Uptrend
│  └─ If SMA50 < SMA200 ──→ Downtrend
│
├─ Bollinger Bands Check
│  ├─ If Price > Upper ──→ Potential overbought
│  ├─ If Price < Lower ──→ Potential oversold
│  └─ If Price in middle ──→ Normal
│
└─ Claude Final Analysis
   ├─ Count bullish vs bearish signals
   ├─ Check confidence level
   ├─ Assess risk
   └─ Generate BUY/SELL/HOLD recommendation
```

---

## 🔐 Security & Error Handling

```
REQUEST
  │
  ├─ Check API Key ──→ ERROR? ──→ Return 401
  │
  ├─ Validate Symbol ──→ ERROR? ──→ Return 400
  │
  ├─ Fetch Data ──→ TIMEOUT? ──→ Return 503
  │
  ├─ Calculate Indicators ──→ ERROR? ──→ Return 500
  │
  ├─ Call Claude API ──→ ERROR? ──→ Return 500
  │                       RATE LIMIT? ──→ Retry
  │
  └─ Parse Response ──→ ERROR? ──→ Return 500
       │
       ▼
    SUCCESS ──→ Return 200 + Recommendation
```

---

## 🚀 Deployment Architecture (Phase 3)

```
                    Internet
                       │
                       ▼
                  ┌─────────────┐
                  │   CDN/DNS   │
                  └─────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌─────────────┐            ┌─────────────┐
   │  Web App    │            │  API Server │
   │  (React)    │            │  (Node.js)  │
   │  Static     │            │  Express    │
   │  Hosting    │            │             │
   │  (Vercel/   │            │  Port 3000  │
   │   Netlify)  │            └─────────────┘
   └─────────────┘                   │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                    ┌──────────────┐     ┌──────────────┐
                    │ PostgreSQL   │     │ Redis Cache  │
                    │ Database     │     │              │
                    └──────────────┘     └──────────────┘
                          │                     │
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
            ┌──────────────────┐          ┌──────────────────┐
            │ Market Data APIs │          │ Anthropic Claude │
            │ yfinance/Finnhub │          │ API              │
            └──────────────────┘          └──────────────────┘
```

---

## 📱 File Interaction Diagram

```
CLIENT CODE
  │
  ├─ client.example.js
  │  └─ Makes HTTP requests to server.js
  │
SERVER LAYER (Node.js/Express)
  │
  ├─ server.js (MAIN)
  │  ├─ Imports: marketDataFetcher.js
  │  ├─ Imports: technicalIndicators.js
  │  ├─ Imports: @anthropic-ai/sdk
  │  ├─ Exports: API endpoints
  │  └─ Handles: Request/Response
  │
DATA LAYER
  │
  ├─ marketDataFetcher.js
  │  ├─ Class: MarketDataFetcher
  │  ├─ Methods: getQuote(), getHistoricalData()
  │  ├─ Supports: yfinance, Finnhub, Alpha Vantage
  │  └─ Returns: StockQuote interface
  │
  ├─ technicalIndicators.js
  │  ├─ Class: TechnicalIndicators
  │  ├─ Methods: sma(), ema(), rsi(), macd(), etc.
  │  ├─ Takes: Close prices array
  │  └─ Returns: Indicators interface
  │
CONFIG
  │
  ├─ .env (not in git)
  │  └─ Stores: API keys, secrets
  │
  ├─ .env.example (in git)
  │  └─ Template: What variables are needed
  │
  ├─ package.json
  │  └─ Dependencies: express, axios, @anthropic-ai/sdk
  │
DOCS
  │
  ├─ README.md
  │  └─ Project overview
  │
  ├─ GETTING_STARTED.md
  │  └─ Setup instructions
  │
  └─ PROJECT_SUMMARY.md
     └─ Complete explanation
```

---

## 🔄 Development Workflow

```
Phase 1: MVP (Current) ✅
├─ Express API server
├─ Mock market data
├─ Basic technical indicators
├─ Claude API integration
└─ BUY/SELL/HOLD recommendations

Phase 2: Real Data 🔄
├─ Connect real market APIs (Finnhub)
├─ Store recommendations in DB
├─ Add caching with Redis
└─ Improve indicator calculations

Phase 3: Dashboard 📊
├─ React frontend
├─ Real-time charts
├─ Portfolio tracking
└─ Alert system

Phase 4: Advanced 🚀
├─ Backtesting engine
├─ Multiple strategies
├─ Machine learning models
└─ Mobile app

Phase 5: Production 🎯
├─ Kubernetes deployment
├─ Monitoring & alerts
├─ Load balancing
└─ 24/7 monitoring
```

---

This should give you a complete visual understanding of how everything connects!
