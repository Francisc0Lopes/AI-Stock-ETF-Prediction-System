/**
 * Market Data Fetcher
 * Handles fetching real-time market data from various sources
 * Supports: yfinance, Finnhub, Alpha Vantage + Yahoo Finance para histórico!
 */

import axios from "axios";
import YahooFinance from 'yahoo-finance2'; // Letra grande (é uma Classe agora)

// O SEGREDO ESTÁ AQUI: Na versão 3, temos de criar a instância antes de a usar!
const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });

export class MarketDataFetcher {
  constructor(dataSource = "finnhub") {
    this.dataSource = dataSource.toLowerCase();
  }

  /**
   * Fetch current quote for a symbol
   */
  async getQuote(symbol) {
    switch (this.dataSource) {
      case "yfinance":
        return this.fetchFromYfinance(symbol);
      case "finnhub":
        return this.fetchFromFinnhub(symbol);
      case "alpha_vantage":
        return this.fetchFromAlphaVantage(symbol);
      default:
        throw new Error(`Unknown data source: ${this.dataSource}`);
    }
  }

  async fetchFromYfinance(symbol) {
    try {
      console.log(`Fetching ${symbol} from yfinance (Mock)...`);
      return {
        symbol: symbol.toUpperCase(),
        price: 150.25,
        previousClose: 147.75,
        open: 148.5,
        dayHigh: 152.3,
        dayLow: 148.0,
        volume: 5200000,
        marketCap: "$2.1T",
        pe: 24.5,
        beta: 1.2,
        fiftyTwoWeekHigh: 185.64,
        fiftyTwoWeekLow: 124.17,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error fetching from yfinance:", error);
      throw error;
    }
  }

  async fetchFromFinnhub(symbol) {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      throw new Error("FINNHUB_API_KEY not set in environment");
    }

    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      if (!data.c) {
        throw new Error(`Dados inválidos recebidos do Finnhub para ${symbol}`);
      }

      return {
        symbol: symbol.toUpperCase(),
        price: data.c,
        previousClose: data.pc,
        open: data.o,
        dayHigh: data.h,
        dayLow: data.l,
        volume: data.v || 0, // Nota: Finnhub grátis nem sempre envia o volume ao segundo
        marketCap: "N/A",
        pe: 0, 
        beta: 0,
        fiftyTwoWeekHigh: data.d52w || data.h,
        fiftyTwoWeekLow: data.w52l || data.l,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Erro ao buscar cotação no Finnhub para ${symbol}:`, error.message);
      throw error;
    }
  }

  async fetchFromAlphaVantage(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      throw new Error("ALPHA_VANTAGE_API_KEY not set in environment");
    }

    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data["Global Quote"];

      if (!data || !data["05. price"]) {
        throw new Error(`No data found for ${symbol}`);
      }

      return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(data["05. price"]),
        previousClose: parseFloat(data["08. previous close"]),
        open: parseFloat(data["02. open"]),
        dayHigh: parseFloat(data["03. high"]),
        dayLow: parseFloat(data["04. low"]),
        volume: parseInt(data["06. volume"]),
        marketCap: "N/A",
        pe: 0,
        beta: 0,
        fiftyTwoWeekHigh: parseFloat(data["03. high"]),
        fiftyTwoWeekLow: parseFloat(data["04. low"]),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error fetching from Alpha Vantage:", error);
      throw error;
    }
  }

  /**
   * Fetch historical data for technical analysis usando o Yahoo Finance (yahoo-finance2)
   */
  async getHistoricalData(symbol, days = 200) {
    try {
      const toDate = new Date();
      const fromDate = new Date();
      
      // Recuamos o dobro dos dias de calendário 
      // para garantir que apanhamos pelo menos 200 dias ÚTEIS de bolsa (sem fds/feriados)
      fromDate.setDate(toDate.getDate() - (days * 2)); 

      const queryOptions = {
        period1: fromDate.toISOString().split('T')[0],
        period2: toDate.toISOString().split('T')[0],
        interval: '1d'
      };

      console.log(`\nObtendo histórico para ${symbol} via Yahoo Finance...`);
      const result = await yahooFinance.historical(symbol, queryOptions);

      if (!result || result.length === 0) {
        console.log(`⚠️ Sem dados históricos suficientes no Yahoo Finance para ${symbol}`);
        return [];
      }

      // Converter o output do Yahoo para o formato exato que a calculadora precisa
      const historicalData = result.map(day => ({
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume
      }));
      
      console.log(`✅ ${historicalData.length} dias de histórico obtidos com sucesso!`);
      return historicalData;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar histórico do Yahoo Finance para ${symbol}:`, error.message);
      return [];
    }
  }
}

export const marketDataFetcher = new MarketDataFetcher(
  process.env.DATA_SOURCE || "finnhub"
);