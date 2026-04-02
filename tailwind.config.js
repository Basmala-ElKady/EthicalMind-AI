/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                flood: {
                    dark: '#0a0a12',
                    water: '#1a3b5c',
                    danger: '#8b0000',
                    highlight: '#00d4ff'
                }
            },
            animation: {
                'rain': 'rain 0.5s linear infinite',
                'riot': 'riot 2s ease-in-out infinite'
            },
            keyframes: {
                rain: {
                    '0%': { transform: 'translateY(-100vh)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                riot: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            }
        },
    },
    plugins: [],
}
