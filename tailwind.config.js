/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc6fb',
          400: '#36a8f7',
          500: '#0a91eb',
          600: '#0074c9',
          700: '#005ca3',
          800: '#024d86',
          900: '#053d6f',
        },
        secondary: {
          50: '#fef6ee',
          100: '#fdead8',
          200: '#fbd3ad',
          300: '#f7b478',
          400: '#f28c44',
          500: '#ed6e1e',
          600: '#dc5513',
          700: '#b63f13',
          800: '#933318',
          900: '#782c17',
        },
        accent: {
          50: '#eefbf3',
          100: '#d6f5e0',
          200: '#b0eac6',
          300: '#7cd7a4',
          400: '#4abb7b',
          500: '#2c9d5d',
          600: '#1e7d4a',
          700: '#1a653d',
          800: '#185134',
          900: '#15432c',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
