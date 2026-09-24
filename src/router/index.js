import { createRouter, createWebHistory } from 'vue-router'

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/system/login/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/system/login/Register.vue')
  },
  {
    path: '/',
    component: () => import('@/views/system/Index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/system/dashboard/Index.vue'),  
        meta: { title: '首页' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/system/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})


router.beforeEach(async (to, from, next) => {
  if (to.path === '/login' || to.path === '/register') {
    next()
    return
  }

  // 只有非登录页面，才去初始化store！！
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 没有token跳登录
  if (!userStore.token) {
    next('/login')
    return
  }

  // 已经有token，但是动态路由还没生成
  if (permissionStore.accessRoutes.length === 0) {
    try {
      const accessRoutes = await permissionStore.generateRoutes()
      accessRoutes.forEach(item => {
        router.addRoute('/', item)
      })
      // 动态路由加载完毕再注册404
      router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/404'
      })
      next({ ...to, replace: true })
    } catch (err) {
      userStore.logout()
      next('/login')
    }
  } else {
    next()
  }
})

import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

export default router