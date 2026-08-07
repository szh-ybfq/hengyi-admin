<template>
  <div class="register-box">
    <el-form :model="registerForm" :rules="rules" ref="registerRef" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="registerForm.password" show-password></el-input>
      </el-form-item>
      <!-- 新增确认密码 -->
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="registerForm.confirmPassword" show-password></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="registerForm.nickname"></el-input>
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          action="/admin/api/v1/upload"
          :on-success="handleUploadSuccess"
          list-type="picture-card"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleRegister">注册</el-button>
        <el-button text @click="$router.push('/login')">已有账号？去登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const registerRef = ref(null)

// 表单数据 增加 confirmPassword
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  avatar: ''
})

// 表单校验规则
const rules = ref({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 5, max: 60, message: '用户名长度5~60位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 60, message: '密码长度6~60位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  nickname: [
    { required: true, message: '昵称不能为空', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度1~50位', trigger: 'blur' }
  ]
})

// 头像上传成功回调
const handleUploadSuccess = (res) => {
  registerForm.value.avatar = res.data.url
  ElMessage.success('头像上传成功')
}

// 注册提交
const handleRegister = async () => {
  await registerRef.value.validate()
  try {
    // 拷贝一份数据，删除confirmPassword，避免传给后端
    const submitData = { ...registerForm.value }
    delete submitData.confirmPassword

    console.log(submitData)
    
    const res = await request.post('/admin/api/v1/user/register', submitData)
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (err) {
    ElMessage.error('注册请求异常')
  }
}
</script>