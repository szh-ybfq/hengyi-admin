import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state() {
    return {
      id: null,
      username: '',
      token: '',
      nickname: '',
      avatar: '',
      // 角色、按钮权限，来自登录接口返回
      roleList: [],
      permissionList: []
    }
  },
  actions: {
    // 保存登录返回的用户VO
    setUserInfo(data) {
      this.id = data.id
      this.username = data.username
      this.token = data.token
      this.nickname = data.nickname
      this.avatar = data.avatar
      // 重点存角色、权限
      this.roleList = data.roleList || []
      this.permissionList = data.permissionList || []
    },
    // 退出登录清空
    resetUser() {
      this.id = null
      this.username = ''
      this.nickname = ''
      this.token = data.token
      this.avatar = ''
      this.roleList = []
      this.permissionList = []
      localStorage.removeItem('token')
    }
  }
})