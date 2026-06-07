/**
 * Stock Prediction AI - Main Server
 * Agora a usar o Groq (Llama 3) para velocidade alucinante e sem limites chatos!
 */

import "dotenv/config";

import Groq from "groq-sdk";
import express from "express";

import { marketDataFetcher } from "./marketDataFetcher.js";
import { TechnicalIndicators } from "./technicalIndicators.js";

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
app.use(express.json());
app.use(express.static('public'));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getMockTechnicalIndicators() {
  return {
    rsi: 65.2,
    macd: 2.45,
    macdSignal: 2.1,
    sma50: 148.5,
    sma200: 142.3,
    bollingerUpper: 165.2,
    bollingerMid: 150.0,
    bollingerLower: 134.8,
    atr: 3.5,
  };
}

async function analyzeStock(symbol, includeAlavancagem = false) {
  const quote = await marketDataFetcher.getQuote(symbol);
  
  const dayChangePercent = (((quote.price - quote.previousClose) / quote.previousClose) * 100).toFixed(2);

  const historicalData = await marketDataFetcher.getHistoricalData(symbol);
  let technicalIndicators;
  
  if (historicalData && historicalData.length >= 200) {
    technicalIndicators = TechnicalIndicators.calculateAll(historicalData);
  } else {
    technicalIndicators = getMockTechnicalIndicators();
  }

  const analysisPrompt = `
Você é um analista financeiro especializado. Analise os seguintes dados de mercado e indicadores técnicos para ${symbol} e forneça uma recomendação de investimento estruturada.

DADOS DE MERCADO:
- Preço Atual: $${quote.price}
- Mudança do Dia: ${dayChangePercent}%
- Volume: ${quote.volume.toLocaleString()}
- P/E Ratio: ${quote.pe || 'N/A'}
- Capitalização: ${quote.marketCap || 'N/A'}
- Máximo 52 semanas: $${quote.fiftyTwoWeekHigh}
- Mínimo 52 semanas: $${quote.fiftyTwoWeekLow}

INDICADORES TÉCNICOS:
- RSI (14): ${technicalIndicators.rsi} (>70 sobrecomprado, <30 sobrevendido)
- MACD: ${technicalIndicators.macd.line || technicalIndicators.macd} (Sinal: ${technicalIndicators.macd.signal || technicalIndicators.macdSignal})
- SMA 50: $${technicalIndicators.sma50 || technicalIndicators.sma?.find(s => s.period === 50)?.value}
- SMA 200: $${technicalIndicators.sma200 || technicalIndicators.sma?.find(s => s.period === 200)?.value}
- Bandas de Bollinger: ${technicalIndicators.bollingerLower?.toFixed(2) || technicalIndicators.bollingerBands?.lower?.toFixed(2)} - ${technicalIndicators.bollingerUpper?.toFixed(2) || technicalIndicators.bollingerBands?.upper?.toFixed(2)}
- ATR (Volatilidade): ${technicalIndicators.atr}

REQUISITOS DA ANÁLISE:
1. Determine se é sinal de BUY, SELL, ou HOLD
2. Forneça nível de confiança (0-100%)
3. Liste sinais bullish e bearish
4. Avalie o nível de risco (LOW/MEDIUM/HIGH)
${includeAlavancagem ? "5. Avalie se trading com alavancagem é apropriado e recomende leverage máximo" : ""}

FORMATO DE RESPOSTA OBRIGATÓRIO (retorne APENAS um objeto JSON válido):
{
  "action": "BUY",
  "confidence": 78,
  "reasoning": "explicação detalhada em português",
  "bullish_signals": ["sinal1", "sinal2"],
  "bearish_signals": ["sinal1"],
  "risk_level": "MEDIUM",
  "leverage": {
    "recommended": false,
    "max_leverage": 0,
    "reasoning": "explicação"
  }
}
`;

  try {
    // A chamar o Llama 3 70B via Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: analysisPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Temperatura baixa para respostas mais analíticas e estruturadas
      response_format: { type: "json_object" }, // Obriga o modelo a responder só com JSON
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    console.log(`✅ Resposta do Groq recebida para ${symbol}`);

    let recommendation = {
      action: "HOLD",
      confidence: 50,
      reasoning: "Análise indisponível",
      signals: { bullish: [], bearish: [] },
      riskLevel: "MEDIUM",
    };

    try {
      const parsed = JSON.parse(responseText);

      recommendation = {
        action: parsed.action || "HOLD",
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
        reasoning: parsed.reasoning || "",
        signals: {
          bullish: Array.isArray(parsed.bullish_signals) ? parsed.bullish_signals : [],
          bearish: Array.isArray(parsed.bearish_signals) ? parsed.bearish_signals : [],
        },
        riskLevel: parsed.risk_level || "MEDIUM",
      };

      if (includeAlavancagem && parsed.leverage) {
        recommendation.leverage = {
          recommended: parsed.leverage.recommended || false,
          maxLeverage: parsed.leverage.max_leverage || 0,
          reasoning: parsed.leverage.reasoning || "",
        };
      }
    } catch (parseError) {
      console.error(`⚠️ Erro ao fazer parse da resposta para ${symbol}:`, parseError.message);
      console.log("Resposta bruta:", responseText);
    }

    return recommendation;
  } catch (error) {
    console.error(`❌ Erro ao chamar Groq API para ${symbol}:`, error.message);
    throw error;
  }
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { symbol, includeAlavancagem = false } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol é obrigatório" });
    }

    console.log(`\n📊 Analisando ${symbol}${includeAlavancagem ? " (com alavancagem)" : ""}...`);

    const recommendation = await analyzeStock(symbol, includeAlavancagem);

    res.json({
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      recommendation,
    });
  } catch (error) {
    console.error("Erro ao analisar ação:", error);
    res.status(500).json({ error: "Falha ao analisar ação: " + error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Stock Prediction AI with Groq",
    apiProvider: "Groq (Llama 3)",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/analyze-batch", async (req, res) => {
  try {
    const { symbols, includeAlavancagem = false } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: "Array de symbols é obrigatório" });
    }

    console.log(`\n📈 Analisando ${symbols.length} ações em lote...`);

    const results = [];
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      console.log(`A processar ${symbol} (${i + 1}/${symbols.length})...`);
      
      results.push({
        symbol,
        recommendation: await analyzeStock(symbol, includeAlavancagem),
      });

      // Pausa de apenas 2s - O Groq aguenta bem mais carga que a tier grátis da Google!
      if (i < symbols.length - 1) {
        await sleep(2000);
      }
    }

    res.json({
      timestamp: new Date().toISOString(),
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Erro ao analisar batch:", error);
    res.status(500).json({ error: "Falha ao analisar batch: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Stock Prediction AI Server (Llama 3 Edition)");
  console.log("=".repeat(60));
  console.log(`🤖 Motor de IA: Groq (llama3-70b-8192)`);
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`📊 POST /api/analyze - Analisar 1 ação`);
  console.log(`📈 POST /api/analyze-batch - Analisar múltiplas ações`);
  console.log(`❤️  GET /api/health - Status do servidor`);
  console.log("=".repeat(60) + "\n");
});