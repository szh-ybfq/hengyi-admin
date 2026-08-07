import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 1. 先创建pinia
import { createPinia } from 'pinia'
const pinia = createPinia()

const app = createApp(App)

// 2. 最先use pinia！！顺序很关键，放在router前面
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')