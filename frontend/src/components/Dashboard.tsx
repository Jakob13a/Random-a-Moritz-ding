"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Activity, Bell, Search, TrendingUp, TrendingDown, Sparkles, ShieldAlert, PlusCircle } from 'lucide-react';

type StockItem = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  category?: string;
  description?: string;
};

const highlights = [
  { label: 'Marktübersicht', value: 'Bullish', detail: 'S&P 500 +0.82%' },
  { label: 'Volatilität', value: 'Mittel', detail: 'VIX 18.4' },
  { label: 'KI-Confidence', value: '82%', detail: 'Stärkster Trend bei Tech' },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function Dashboard() {
  const [query, setQuery] = useState('');
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [customHistory, setCustomHistory] = useState('');
  const [customFleet, setCustomFleet] = useState('');
  const [customPassengers, setCustomPassengers] = useState('');
  const [customAirports, setCustomAirports] = useState('');
  const [customStrategy, setCustomStrategy] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (userEmail) params.append('user', userEmail);
    const url = `${apiUrl}/stocks${params.toString() ? `?${params.toString()}` : ''}`;

    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend nicht erreichbar');
        }
        return response.json();
      })
      .then((data) => {
        setStocks(Array.isArray(data) ? data : []);
        setLoading(false);
        setBackendError(false);
      })
      .catch(() => {
        setStocks([]);
        setLoading(false);
        setBackendError(true);
      });

    return () => controller.abort();
  }, [query, userEmail]);

  const handleAddAsset = async (event: React.FormEvent) => {
    event.preventDefault();
    const history = customHistory
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));

    if (!userEmail || !customSymbol || !customName || history.length < 3) {
        setFeedback('Bitte E-Mail, Symbol, Namen und mindestens drei historische Kurse eingeben.');
        return;
      }

      const payload = {
        email: userEmail,
        symbol: customSymbol,
        name: customName,
        history,
        gameType: 'AirlineManager4',
        fleetSize: Number(customFleet) || undefined,
        dailyPassengers: Number(customPassengers) || undefined,
        airportFocus: customAirports || undefined,
        strategy: customStrategy || undefined,
      };

      try {
      const response = await fetch(`${apiUrl}/stocks/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        setFeedback('Asset gespeichert. Suche nach dem Asset oder lade die Seite neu.');
        setCustomSymbol('');
        setCustomName('');
        setCustomHistory('');
        setCustomFleet('');
        setCustomPassengers('');
        setCustomAirports('');
        setCustomStrategy('');
        setQuery('');
      } else {
        setFeedback(data.detail || 'Das Asset konnte nicht gespeichert werden.');
      }
    } catch (error) {
      setFeedback('Das Backend konnte nicht erreicht werden. Bitte prüfe die Verbindung zum lokalen API-Server.');
    }
  };

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Sparkles className="h-4 w-4 text-emerald-400" /> Moritz AI Stock Tracker
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Moderne Aktienanalyse mit KI-Prognosen</h1>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3 text-sm text-slate-300">
                <Search className="h-4 w-4" />
                <input
                  className="bg-transparent outline-none"
                  placeholder="AAPL, NVDA, AM4-BA..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button className="rounded-2xl border border-white/10 bg-slate-800/70 p-3 text-slate-200">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live-Markt</p>
                <h2 className="text-xl font-semibold text-white">Suche & Watchlist</h2>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Live</div>
            </div>

            <form onSubmit={handleAddAsset} className="mb-4 rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-sky-400" />
                  <span>AirlineManager4-Asset hinzufügen</span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Nur lokal</span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none" placeholder="Benutzer-E-Mail" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} />
                <input className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none" placeholder="Symbol (z.B. AM4-BA)" value={customSymbol} onChange={(event) => setCustomSymbol(event.target.value)} />
                <input className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none" placeholder="Name (z.B. Budget Airline)" value={customName} onChange={(event) => setCustomName(event.target.value)} />
              </div>
              <div className="grid gap-3 md:grid-cols-4 mt-3">
                <input className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none" placeholder="Flottengröße" value={customFleet} onChange={(event) => setCustomFleet(event.target.value)} />
                <input className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none" placeholder="Tägliche Passagiere" value={customPassengers} onChange={(event) => setCustomPassengers(event.target.value)} />
                <input className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none" placeholder="Airport-Fokus (z.B. BER,FRA)" value={customAirports} onChange={(event) => setCustomAirports(event.target.value)} />
                <input className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none" placeholder="Strategie (z.B. Low-Cost)" value={customStrategy} onChange={(event) => setCustomStrategy(event.target.value)} />
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-400">
                <p className="font-medium text-white">Eingabehilfe</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-400">
                  <li>Symbol: Kürzel des Spiel-Assets, z.B. <span className="text-slate-200">AM4-BA</span>.</li>
                  <li>E-Mail: Nutzerkennung zur Speicherung eigener AM4-Assets.</li>
                  <li>Name: Dein Airline- oder Asset-Name.</li>
                  <li>Historische Kurse: Kommagetrennte Schlusskurse, z.B. <span className="text-slate-200">88,89,91,93</span>.</li>
                  <li>Passagiere: Durchschnittliche tägliche Passagiere.</li>
                  <li>Airport-Fokus: Wichtige Basen, z.B. <span className="text-slate-200">BER,FRA</span>.</li>
                  <li>Strategie: <span className="text-slate-200">Low-Cost</span>, <span className="text-slate-200">Premium</span> oder <span className="text-slate-200">Regional</span>.</li>
                </ul>
              </div>

              <button className="mt-3 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white" type="submit">Asset speichern</button>
              {feedback ? <p className="mt-3 text-sm text-slate-400">{feedback}</p> : null}
            </form>

            {loading ? (
              <p className="text-sm text-slate-400">Lade Treffer...</p>
            ) : backendError ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                Die lokale API ist nicht erreichbar. Starte das Backend auf Port 8000 und lade die Seite neu.
              </div>
            ) : stocks.length === 0 ? (
              <p className="text-sm text-slate-400">Keine Treffer gefunden. Versuche es mit einem anderen Begriff.</p>
            ) : (
              <div className="space-y-3">
                {stocks.map((stock) => (
                  <Link key={stock.symbol} href={`/stocks/${stock.symbol.toLowerCase()}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3 transition hover:border-sky-400/30 hover:bg-slate-700/70">
                    <div>
                      <p className="font-medium text-white">{stock.symbol}</p>
                      <p className="text-sm text-slate-400">{stock.name}</p>
                      {stock.category === 'game' ? <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Game Asset</p> : null}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${stock.price.toFixed(2)}</p>
                      <p className={`text-sm ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stock.change >= 0 ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />} {Math.abs(stock.change).toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2 text-slate-300">
                <ShieldAlert className="h-5 w-5 text-amber-400" /> Hinweis zur KI
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Die Prognosen sind probabilistisch und keine Finanzberatung. Sie dienen nur zur Marktanalyse und sollten mit eigener Forschung kombiniert werden.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2 text-slate-300">
                <Activity className="h-5 w-5 text-sky-400" /> Marktübersicht
              </div>
              <div className="space-y-3">
                {highlights.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3">
                    <div>
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="font-medium text-white">{item.value}</p>
                    </div>
                    <p className="text-sm text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
