/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "rgba(var(--border), <alpha-value>)",
        background: "rgba(var(--background), <alpha-value>)",
        foreground: "rgba(var(--foreground), <alpha-value>)",
        card: "rgba(var(--card), <alpha-value>)",
        cardBorder: "rgba(var(--card-border), <alpha-value>)",
        sidebar: "rgba(var(--sidebar), <alpha-value>)",
        primary: {
          DEFAULT: "#6366f1", // Indigo
          hover: "#4f46e5",
          dark: "#818cf8",
        },
        success: {
          DEFAULT: "#10b981", // Emerald
          bg: "#d1fae5",
          darkBg: "#064e3b",
        },
        warning: {
          DEFAULT: "#f59e0b", // Amber
          bg: "#fef3c7",
          darkBg: "#78350f",
        },
        danger: {
          DEFAULT: "#ef4444", // Red
          bg: "#fee2e2",
          darkBg: "#7f1d1d",
        },
        info: {
          DEFAULT: "#0ea5e9", // Sky
          bg: "#e0f2fe",
          darkBg: "#0c4a6e",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
