import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#020617',
        slateblue: '#1d4ed8',
        mint: '#22c55e',
        danger: '#ef4444',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
