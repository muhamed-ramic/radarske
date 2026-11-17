import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { bihamkScraperPlugin } from './src/server/vitePluginBihamk.js';

export default defineConfig({
  plugins: [
    react(),
    bihamkScraperPlugin()
  ],
  server: {
    port: 5173,
    host: true
  }
});
