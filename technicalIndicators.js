/**
 * Technical Indicators Calculator
 * Calculates RSI, MACD, Moving Averages, Bollinger Bands, ATR, etc.
 *
 * In production, use TA-Lib or pandas_ta for better performance
 */

export class TechnicalIndicators {
  /**
   * Calculate Simple Moving Average
   * SMA = Sum of close prices / number of periods
   */
  static sma(closes, period) {
    if (closes.length < period) {
      throw new Error(`Not enough data. Need ${period}, got ${closes.length}`);
    }

    const sum = closes.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Exponential Moving Average
   * Gives more weight to recent prices
   */
  static ema(closes, period) {
    if (closes.length < period) {
      throw new Error(`Not enough data. Need ${period}, got ${closes.length}`);
    }

    const multiplier = 2 / (period + 1);
    let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < closes.length; i++) {
      ema = closes[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   * Measures momentum: 0-100
   * >70 = overbought (potential sell), <30 = oversold (potential buy)
   */
  static rsi(closes, period = 14) {
    if (closes.length < period + 1) {
      throw new Error(
        `Not enough data. Need ${period + 1}, got ${closes.length}`
      );
    }

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
      const difference = closes[i] - closes[i - 1];
      if (difference > 0) {
        gains += difference;
      } else {
        losses += Math.abs(difference);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) {
      return avgGain === 0 ? 50 : 100;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return Math.round(rsi * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * Trend-following momentum indicator
   */
  static macd(closes) {
    if (closes.length < 26) {
      throw new Error("Need at least 26 periods for MACD");
    }

    const ema12 = this.ema(closes, 12);
    const ema26 = this.ema(closes, 26);
    const macdLine = ema12 - ema26;

    // For simplicity, use simple moving average of MACD line as signal
    // In production, use exponential moving average
    const recentMACDValues = [];
    for (let i = Math.max(0, closes.length - 26); i < closes.length; i++) {
      const e12 = this.ema(closes.slice(0, i + 1), 12);
      const e26 = this.ema(closes.slice(0, i + 1), 26);
      recentMACDValues.push(e12 - e26);
    }

    const signal =
      recentMACDValues.slice(-9).reduce((a, b) => a + b, 0) /
      Math.min(9, recentMACDValues.length);
    const histogram = macdLine - signal;

    return {
      line: Math.round(macdLine * 100) / 100,
      signal: Math.round(signal * 100) / 100,
      histogram: Math.round(histogram * 100) / 100,
    };
  }

  /**
   * Calculate Bollinger Bands
   * Volatility indicator with upper/lower bands
   */
  static bollingerBands(closes, period = 20, stdDev = 2) {
    if (closes.length < period) {
      throw new Error(`Not enough data. Need ${period}, got ${closes.length}`);
    }

    const middle = this.sma(closes, period);
    const recentCloses = closes.slice(-period);

    // Calculate standard deviation
    const squaredDifferences = recentCloses.map((c) => Math.pow(c - middle, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: Math.round((middle + stdDev * standardDeviation) * 100) / 100,
      middle: Math.round(middle * 100) / 100,
      lower: Math.round((middle - stdDev * standardDeviation) * 100) / 100,
    };
  }

  /**
   * Calculate Average True Range (ATR)
   * Volatility indicator
   */
  static atr(data, period = 14) {
    if (data.length < period) {
      throw new Error(`Not enough data. Need ${period}, got ${data.length}`);
    }

    let trueRanges = [];

    for (let i = 1; i < data.length; i++) {
      const tr = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      trueRanges.push(tr);
    }

    const atr = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;

    return Math.round(atr * 100) / 100;
  }

  /**
   * Calculate Average Directional Index (ADX)
   * Trend strength indicator (0-100)
   * >25 = strong trend, <20 = weak trend
   */
  static adx(data, period = 14) {
    if (data.length < period * 2) {
      throw new Error(
        `Not enough data. Need ${period * 2}, got ${data.length}`
      );
    }

    let upMoves = 0;
    let downMoves = 0;

    for (let i = 1; i < data.length; i++) {
      const upMove = data[i].high - data[i - 1].high;
      const downMove = data[i - 1].low - data[i].low;

      if (upMove > downMove && upMove > 0) {
        upMoves++;
      } else if (downMove > upMove && downMove > 0) {
        downMoves++;
      }
    }

    const diPlus = (upMoves / data.length) * 100;
    const diMinus = (downMoves / data.length) * 100;
    const adx = Math.abs(diPlus - diMinus);

    return Math.round(adx * 100) / 100;
  }

  /**
   * Calculate all indicators at once
   */
  static calculateAll(data) {
    const closes = data.map((d) => d.close);

    return {
      sma: [
        { period: 20, value: this.sma(closes, 20) },
        { period: 50, value: this.sma(closes, 50) },
        { period: 200, value: this.sma(closes, 200) },
      ],
      ema: [
        { period: 12, value: this.ema(closes, 12) },
        { period: 26, value: this.ema(closes, 26) },
      ],
      rsi: this.rsi(closes),
      macd: this.macd(closes),
      bollingerBands: this.bollingerBands(closes),
      atr: this.atr(data),
      adx: this.adx(data),
    };
  }
}