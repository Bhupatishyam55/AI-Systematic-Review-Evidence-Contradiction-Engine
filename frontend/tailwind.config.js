// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This MUST correctly point to all files using Tailwind classes
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}