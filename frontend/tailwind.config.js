/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: '#a8d4b8',    // verde menta suave
        moss: '#7ab898',    // verde menta más profundo
        rose: '#e8a0d4',    // rosa suave
        blush: '#f4c8e8',   // rosa más clarito
        cream: '#fff9fe',   // blanco con toque rosado
        lila: '#c4b0e8',    // lila principal
        lilac: '#a090d4',   // lila más profundo
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}