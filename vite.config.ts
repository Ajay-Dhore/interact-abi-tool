import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'global.crypto': 'crypto', // ✅ this is the line that fixes your issue
  },
  resolve: {
    alias: {
      crypto: 'node:crypto', // ✅ make sure this line is also there
    },
  },
})
