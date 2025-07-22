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
        dark: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
        },
      },
    },
  },
  plugins: [],
}