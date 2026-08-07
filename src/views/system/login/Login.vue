<template>
  <div class="login-box">
    <el-form :model="loginForm" label-width="80px">
      <el-form-item label="账号">
        <el-input v-model="loginForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" show-password></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
        <!-- 注册跳转按钮 -->
        <el-button text @click="$router.push('/register')">没有账号？去注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
// 引入两个仓库
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const res = await request.post('/admin/api/v1/user/login', loginForm.value)
    console.log('登录返回结果', res)
    if (res.code === 200) {
      // 1、存token
      localStorage.setItem('token', res.data.token)
      userStore.setUserInfo(res.data)

      ElMessage.success('登录成功')
      // 直接跳 /，交给路由守卫 beforeEach 去拉菜单、addRoute动态路由
      router.push('/')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (err) {
    ElMessage.error('请求异常')
  }
}
</script>