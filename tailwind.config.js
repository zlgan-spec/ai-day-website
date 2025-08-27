/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.html",
    "./assets/**/*.js"
  ],
  theme: {
    extend: {
                        colors: {
                    'brand': '#FF6B2B',
                    'brand-light': '#FF8A4D',
                    'brand-dark': '#E55A1F',
                    'dark-gray': '#1A1A1A',
                    'card-bg': 'rgba(0, 0, 0, 0.5)'
                  },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
