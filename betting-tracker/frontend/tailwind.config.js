/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Vibrant blue (main brand color)
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },

        // Success (Wins)
        success: {
          100: "#dcfce7",
          300: "#86efac",
          500: "#22c55e", // Green
          700: "#15803d",
        },

        // Danger (Losses)
        danger: {
          100: "#fee2e2",
          300: "#fca5a5",
          500: "#ef4444", // Red
          700: "#b91c1c",
        },

        // Warning (Pending)
        warning: {
          100: "#fef3c7",
          300: "#fcd34d",
          500: "#f59e0b", // Amber
          700: "#b45309",
        },

        // Dark Mode Neutrals
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b", // Dark mode surface
          900: "#0f172a", // Dark mode background
          950: "#020617",
        },

        // Accent Colors
        accent: {
          500: "#8b5cf6", // Purple
          600: "#7c3aed",
        },
      },
    },
  },
  plugins: [],
};
