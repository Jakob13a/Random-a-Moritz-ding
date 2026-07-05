"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type HistoryPoint = {
  date: string;
  close: number;
};

export function PriceChart({ history }: { history: HistoryPoint[] }) {
  const labels = history.map((item) => item.date);
  const data = history.map((item) => item.close);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Schlusskurs',
              data,
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              tension: 0.35,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { grid: { color: 'rgba(255,255,255,0.06)' } },
          },
        }}
      />
    </div>
  );
}
