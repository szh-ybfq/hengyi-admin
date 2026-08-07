import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve:{
    alias:{
      '@': resolve(__dirname, 'src')
    }
  },
  server:{
    proxy:{  //本地代理，他会将target和/admin/api/v1拼接，作为后端完整地址
      '/admin/api/v1':{
        target:'http://localhost:8080',
        changeOrigin:true
      }
    }
  }
})