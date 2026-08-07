<template>
  <div class="layout-wrap">
    <!-- 左侧侧边栏 -->
    <Sidebar />
    <!-- 右边整体：头部 + 内容区 -->
    <div class="layout-right">
      <Header />
      <Main />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Main from '@/components/Main.vue'
</script>

<style scoped>
.layout-wrap {
  display: flex;
  height: 100vh;
}
.layout-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
</style>