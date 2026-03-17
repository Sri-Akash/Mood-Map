/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mood: {
          happy: '#FCD34D',
          calm: '#6EE7B7',
          neutral: '#9CA3AF',
          sad: '#60A5FA',
          angry: '#F87171',
        }
      }
    },
  },
  plugins: [],
}
