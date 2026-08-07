import axios from 'axios'
import { ElMessage } from 'element-plus'

// 后端基础地址
const baseUrl = ''

const service = axios.create({
  baseURL: baseUrl,
  timeout: 10000
})

// 请求拦截器：（在到达后业务代码前）
/* 
    作用：每次发送请求【之前】统一处理, 自动从本地存储拿出 token，塞进请求头，不用每个接口手动写 token；

    前端拦截器：浏览器里执行，控制发出去的请求、收到的响应；
    后端过滤器：服务器里执行，控制到达接口之前、响应返回前端之前。
*/
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if(token){
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// 响应拦截器:  （在到达前端业务代码前）
//      作用：直接把 res.data 返回，页面不用多层取值
service.interceptors.response.use(res=>{
  return res.data
}, err=>{
  // 判断响应状态码
  if (err.response?.status === 401) {
    ElMessage.warning('登录已失效，请重新登录')
    localStorage.removeItem('token')
    // 跳转到登录页
    router.push('/login')
  } else {
    ElMessage.error('网络请求失败')
  }
  return Promise.reject(err)
})

export default service