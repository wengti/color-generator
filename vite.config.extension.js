// vite.config.extension.js
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' }

export default defineConfig({
  plugins: [
    crx({ manifest })
  ],
  build: {
    outDir: 'dist',  // Extension stays in 'dist'
    rollupOptions: {
      input: {
        popup: 'index.html'
      }
    }
  }
})