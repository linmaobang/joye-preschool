import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 使用绝对路径，确保 /shop /pinyin /poems 等二级路由下静态资源从根加载（相对路径会被 Cloudflare _redirects 回退成 HTML 导致白屏）
  base: '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 建议清理旧文件
    emptyOutDir: true
  }
})
