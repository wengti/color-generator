// vite.config.website.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist-website'  // Output to a different folder
  }
})