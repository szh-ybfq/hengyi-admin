import { defineStore } from 'pinia'
import { getLoginUserMenu } from '@/api/system'

// ✅组件映射表：key 和数据库menu.component字段完全一模一样
const componentMap = {
  'Layout': () => import('@/views/system/Index.vue'),
  'system/user/index': () => import('@/views/system/user/index.vue'),
  'system/role/index': () => import('@/views/system/role/index.vue'),
  'system/menu/index': () => import('@/views/system/menu/index.vue'),
  'dashboard/index': () => import('@/views/system/dashboard/Index.vue'),
  'system/product/category/index': () => import('@/views/system/product/category/index.vue'),
  'system/product/spu/index': () => import('@/views/system/product/spu/index.vue'),
}


// 后端菜单树 → 转换成路由规则
function buildRoutes(menuList) {
  const res = []
  menuList.filter(item => item.menuType !== 'F').forEach(item => {
    const route = {
      path: item.path,
      name: item.menuName,
      // 取不到赋值null，避免component为undefined
      component: componentMap[item.component] ?? null,
      meta: {
        title: item.menuName,
        icon: item.icon
      }
    }
    if (item.children && item.children.length > 0) {
      route.children = buildRoutes(item.children)
    }
    res.push(route)
  })
  return res
}



export const usePermissionStore = defineStore('permission', {
  state() {
    return {
      accessRoutes: [],
      sidebarMenu: []
    }
  },
  actions: {
    async generateRoutes() {
      const result = await getLoginUserMenu()
      
      this.sidebarMenu = result.data
      this.accessRoutes = buildRoutes(result.data)

      return this.accessRoutes
    },
    resetRoutes() {
      this.accessRoutes = []
      this.sidebarMenu = []
    }
  }
})