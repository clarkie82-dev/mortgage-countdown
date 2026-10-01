import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// GitHub Pages project site: https://<user>.github.io/mortgage-countdown/
const repoBase = '/mortgage-countdown/'

export default defineConfig({
  base: process.env.VITE_BASE ?? repoBase,
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
