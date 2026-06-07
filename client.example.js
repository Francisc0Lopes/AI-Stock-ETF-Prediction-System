/**
 * Example Client for Stock Prediction AI
 * Tests the API endpoints with sample requests
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function analyzeSingleStock() {
  try {
    console.log("\n📊 Analyzing Apple (AAPL)...\n");

    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      symbol: "AAPL",
      includeAlavancagem: false,
    });

    const { recommendation } = response.data;
    console.log("✅ Recommendation:", recommendation.action);
    console.log(`Confidence: ${recommendation.confidence}%`);
    console.log(`Risk Level: ${recommendation.riskLevel}`);
    console.log(`\nReasoning: ${recommendation.reasoning}`);
    console.log(`\nBullish Signals: ${recommendation.signals.bullish.join(", ")}`);
    console.log(`Bearish Signals: ${recommendation.signals.bearish.join(", ")}`);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

async function analyzeMultipleStocks() {
  try {
    console.log("\n📈 Analyzing multiple stocks...\n");

    const response = await axios.post(`${API_BASE_URL}/analyze-batch`, {
      symbols: ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"],
      includeAlavancagem: false,
    });

    console.log("\nBatch Results:\n");

    response.data.results.forEach((result) => {
      const { symbol, recommendation } = result;
      console.log(`${symbol}: ${recommendation.action} (${recommendation.confidence}%)`);
    });

    console.log("\n✅ Batch analysis complete");
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

async function analyzeWithLeverage() {
  try {
    console.log("\n🔥 Analyzing with leverage consideration...\n");

    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      symbol: "QQQ", 
      includeAlavancagem: true,
    });

    const { recommendation } = response.data;

    console.log("Recommendation:", recommendation.action);
    console.log(`Risk Level: ${recommendation.riskLevel}`);

    if (recommendation.leverage) {
      console.log("\nLeverage Analysis:");
      console.log(
        `Recommended: ${recommendation.leverage.recommended ? "YES" : "NO"}`
      );
      if (recommendation.leverage.recommended) {
        console.log(`Max Leverage: ${recommendation.leverage.maxLeverage}x`);
        console.log(`Reasoning: ${recommendation.leverage.reasoning}`);
      }
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

async function healthCheck() {
  try {
    console.log("\n🏥 Checking server health...\n");

    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log("Status:", response.data.status);
    console.log("Service:", response.data.service);
  } catch (error) {
    console.error("Server is not running. Start it with: npm run dev");
  }
}

async function runExamples() {
  console.log("🤖 Stock Prediction AI - Client Examples");
  console.log("=========================================");

  await healthCheck();
  
  await analyzeSingleStock();
  console.log("\n⏳ A aguardar 4 segundos para a API respirar...");
  await sleep(4000);
  
  await analyzeWithLeverage();
  console.log("\n⏳ A aguardar 4 segundos para a API respirar...");
  await sleep(4000);
  
  await analyzeMultipleStocks();

  console.log("\n✨ All examples completed!");
}

// Run if called directly
runExamples().catch(console.error);

export { analyzeSingleStock, analyzeMultipleStocks, analyzeWithLeverage };