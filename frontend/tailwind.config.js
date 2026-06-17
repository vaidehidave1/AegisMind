/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sentinel-black': '#0a0a0a',
        'sentinel-navy': '#0f172a',
        'sentinel-graphite': '#1e293b',
        'sentinel-cyan': '#00f0ff',
        'sentinel-teal': '#00ffcc',
        'sentinel-emerald': '#10b981',
        'sentinel-red': '#ef4444',
        'sentinel-amber': '#f59e0b',
        'sentinel-panel': 'rgba(15, 23, 42, 0.7)',
        'sentinel-border': 'rgba(0, 240, 255, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
