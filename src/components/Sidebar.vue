<template>
  <div class="sidebar">
    <el-menu
      router
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :default-active="$route.path"
      :default-openeds="openKeys"
    >
      <template v-for="menu in menuList" :key="menu.path">
        <el-sub-menu v-if="menu.children && menu.children.length" :index="menu.path">
          <template #title>{{ menu.menuName }}</template>
          <template v-for="child in menu.children" :key="child.path">
            <el-menu-item :index="child.path">{{ child.menuName }}</el-menu-item>
          </template>
        </el-sub-menu>
        <el-menu-item v-else :index="menu.path">{{ menu.menuName }}</el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()
const menuList = permissionStore.sidebarMenu

// 默认展开所有一级父菜单，把父菜单path收集起来
const openKeys = computed(() => {
  return menuList.filter(item => item.children && item.children.length).map(item => item.path)
})
</script>

<style scoped>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background-color: #304156;
}
</style>