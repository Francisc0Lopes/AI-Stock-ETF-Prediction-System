import { useState } from 'react'
import axios from 'axios'
import { TrendingUp, Loader } from 'lucide-react'

export default function App() {
  const [symbol, setSymbol] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!symbol.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:3000/api/analyze', {
        symbol: symbol.toUpperCase(),
        includeAlavancagem: false
      })
      setResult(response.data)
    } catch (err) {
      setError('Erro ao analisar. Verifica o símbolo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action) => {
    switch(action) {
      case 'BUY': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'SELL': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'HOLD': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Stock AI</h1>
              <p className="text-xs text-slate-400">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-400">Servidor Online</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Análise de Ações com <span className="gradient-text">IA</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Recomendações inteligentes alimentadas por Google Gemini
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-xl p-8 border border-slate-700 card-hover mb-8">
          <form onSubmit={handleAnalyze} className="flex gap-2 mb-6">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Ex: AAPL, MSFT, GOOGL..."
              className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 px-8 py-3 rounded-lg font-semibold transition text-white flex items-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Analisando...' : 'Analisar'}
            </button>
          </form>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Symbol */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-sm">Símbolo</p>
                  <h3 className="text-3xl font-bold">{result.symbol}</h3>
                </div>
                <div className="text-right">
                  <div className={`px-6 py-3 rounded-lg border font-semibold ${getActionColor(result.recommendation.action)}`}>
                    {result.recommendation.action}
                  </div>
                  <p className="text-2xl font-bold text-blue-400 mt-2">{result.recommendation.confidence}%</p>
                  <p className="text-xs text-slate-400">Confiança</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-300">{result.recommendation.reasoning}</p>
              </div>

              {/* Signals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold text-sm mb-2">📈 Sinais Bullish</h4>
                  <ul className="space-y-1">
                    {result.recommendation.signals.bullish.map((signal, i) => (
                      <li key={i} className="text-xs text-green-300">✓ {signal}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold text-sm mb-2">📉 Sinais Bearish</h4>
                  <ul className="space-y-1">
                    {result.recommendation.signals.bearish.map((signal, i) => (
                      <li key={i} className="text-xs text-red-300">✗ {signal}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk Level */}
              <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-400">Nível de Risco</span>
                <span className={`font-semibold ${
                  result.recommendation.riskLevel === 'LOW' ? 'text-green-400' :
                  result.recommendation.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {result.recommendation.riskLevel}
                </span>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-slate-500 text-center">
                Analisado em: {new Date(result.timestamp).toLocaleString('pt-PT')}
              </p>
            </div>
          )}

          {!result && !loading && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg">Pesquisa uma ação para ver a análise</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm border-t border-slate-700 pt-8">
          <p>⚠️ Aviso Legal: Sistema educacional apenas. Não é aconselhamento financeiro.</p>
          <p className="mt-2 text-xs">
            <a href="https://github.com/Francisc0Lopes/AI-Stock-ETF-Prediction-System" className="text-blue-400 hover:underline">
              GitHub Repository
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}