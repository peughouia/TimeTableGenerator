import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    open: true,
    host: '0.0.0.0', // Écoute sur toutes les interfaces
    port: 5173,      // Port par défaut (vous pouvez le changer si besoin)
  },
})
