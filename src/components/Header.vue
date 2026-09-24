<template>
  <el-header
    style="background:#fff;border-bottom:1px solid #e4e7ed;display:flex;justify-content:space-between;align-items:center;padding:0 20px;height: 60px;"
  >
    <div style="font-weight: 700;font-size: 30px;">&nbsp;&nbsp;恒宜系统</div>
    <div>
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{ username }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-button type="danger" size="small" @click="handleLogoutClick" style="width:100%">
                退出登录
              </el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { logout } from '@/api/system'

const router = useRouter()
const username = ref('')

onMounted(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  username.value = userInfo.username || '管理员'
})

// 按钮直接绑定这个方法
async function handleLogoutClick() {
  try {
    // 请求后端退出接口，销毁redis里面的token会话
    await logout()
  } catch (err) {
    console.error('退出接口异常', err)
  }
  // 清空本地
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('退出成功')
  // 跳转到登录页
  await router.push('/login')
}

// 原来的command可以删掉，现在不走这个了
function handleCommand() {}
</script>

<style scoped>
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>