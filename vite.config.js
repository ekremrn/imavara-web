import { defineConfig } from 'vite'
export default defineConfig({
  server: {host: '127.0.0.1', proxy: {'/v1': {target: process.env.IMAVARA_API_URL || 'http://127.0.0.1:18080', ws:true}}}
})
