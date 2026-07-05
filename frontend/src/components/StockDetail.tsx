"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, BarChart3, ShieldAlert } from 'lucide-react';
import { PriceChart } from '@/components/PriceChart';

type Prediction = {
  symbol: string;
  probability_up: number;
  probability_down: number;
  expected_price_tomorrow: number;
  expected_price_next_week: number;
  expected_price_next_month: number;
  confidence: number;
  trend: string;
  disclaimer: string;
};

type StockDetailData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  marketCap: string;
  peRatio: string | number;
  dividendYield: string;
  description: string;
  category?: string;
};

const explanations = [
  {
    label: 'RSI',
    text: 'Der Relative Strength Index zeigt überkaufte oder überverkaufte Zustände im Markt an. Werte über 70 deuten auf mögliche Überhitzung hin, Werte unter 30 auf Erschöpfung.',
  },
  {
    label: 'MACD',
    text: 'Der MACD vergleicht zwei gleitende Durchschnitte und signalisiert Momentum-Wechsel. Positive Werte unterstützen bullische Tendenzen.',
  },
  {
    label: 'EMA / SMA',
    text: 'EMA und SMA glätten den Kursverlauf. EMA reagiert schneller auf aktuelle Bewegungen, SMA zeigt den mittelfristigen Trend.',
  },
  {
    label: 'Prognose',
    text: 'Die KI gibt Wahrscheinlichkeiten für steigende und fallende Kurse aus. Das Ergebnis ist keine Anlageempfehlung, sondern eine Analysehilfe.',
  },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function StockDetail({ symbol }: { symbol: string }) {
  const [stock, setStock] = useState<StockDetailData | null>(null);
  const [history, setHistory] = useState<{ date: string; close: number }[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stockSymbol = symbol.toUpperCase();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [stockRes, historyRes, predictionRes] = await Promise.all([
          fetch(`${apiUrl}/stocks/${stockSymbol}`),
          fetch(`${apiUrl}/stocks/${stockSymbol}/history`),
          fetch(`${apiUrl}/predictions/${stockSymbol}`),
        ]);

        if (!stockRes.ok || !historyRes.ok || !predictionRes.ok) {
          throw new Error('Daten konnten nicht geladen werden.');
        }

        const stockData = await stockRes.json();
        const historyData = await historyRes.json();
        const predictionData = await predictionRes.json();

        setStock(stockData);
        setHistory(historyData);
        setPrediction(predictionData);
      } catch (err) {
        setError('Die aktuellen Daten konnten nicht geladen werden. Bitte versuche es später erneut.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [stockSymbol]);

  const price = stock?.price ?? 0;
  const change = stock?.change ?? 0;

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Aktienprofil</p>
              <h1 className="text-3xl font-semibold text-white">{stock?.name ?? stockSymbol}</h1>
              <p className="mt-2 text-sm text-slate-400">{stock?.description ?? 'Detaillierte Analyse des gewählten Symbols.'}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/90 px-4 py-3 text-right text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live-Preis</p>
              <p className="mt-1 text-2xl font-semibold">${price.toFixed(2)}</p>
              <p className={change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {change >= 0 ? <ArrowUpRight className="inline h-4 w-4" /> : <ArrowDownRight className="inline h-4 w-4" />} {change.toFixed(2)}%
              </p>
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-slate-100">{error}</div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-slate-300">
              <BarChart3 className="h-5 w-5 text-sky-400" /> Technische Kennzahlen
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['RSI', '61.4'],
                ['MACD', '0.82'],
                ['EMA 20', '210.8'],
                ['SMA 50', '208.5'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white">Aktienhistorie</h2>
              <div className="mt-4 h-72">
                <PriceChart history={history.length ? history : [{ date: '2024-01-01', close: price }]} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-slate-300">
              <ShieldAlert className="h-5 w-5 text-amber-400" /> KI-Prognose
            </div>
            {prediction ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Trend</p>
                    <span className={`rounded-full px-3 py-1 text-sm ${prediction.trend === 'Bullish' ? 'bg-emerald-500/15 text-emerald-300' : prediction.trend === 'Bearish' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>
                      {prediction.trend}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-400">Wahrscheinlichkeit steigend</p>
                      <p className="text-2xl font-semibold text-white">{(prediction.probability_up * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Wahrscheinlichkeit fallend</p>
                      <p className="text-2xl font-semibold text-white">{(prediction.probability_down * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    ['Morgen', prediction.expected_price_tomorrow],
                    ['Woche', prediction.expected_price_next_week],
                    ['Monat', prediction.expected_price_next_month],
                  ].map(([label, value]) => {
                    const numericValue = typeof value === 'number' ? value : Number(value);
                    return (
                      <div key={label} className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                        <p className="text-sm text-slate-400">{label}</p>
                        <p className="mt-1 text-lg font-semibold text-white">${numericValue.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4 text-sm text-slate-400">
                  <p>Konfidenz: {prediction.confidence}%</p>
                  <p className="mt-2">{prediction.disclaimer}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Lade Prognose...</p>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-800/60 p-4 text-sm text-slate-400">
              <h3 className="text-white">Erklärung der Werte</h3>
              <div className="mt-4 space-y-3">
                {explanations.map((item) => (
                  <div key={item.label}>
                    <p className="font-medium text-white">{item.label}</p>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
