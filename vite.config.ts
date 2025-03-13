import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/WhatsForLunch/', // Proje adınız neyse buraya onu yazın
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});