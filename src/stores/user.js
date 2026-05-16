import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const userType = ref(localStorage.getItem('userType') || '')
  const permissions = ref(JSON.parse(localStorage.getItem('permissions') || '[]'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userType.value === 'ADMIN')

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    username.value = info.username
    userType.value = info.userType
    permissions.value = info.permissions || []
    localStorage.setItem('username', info.username)
    localStorage.setItem('userType', info.userType)
    localStorage.setItem('permissions', JSON.stringify(info.permissions || []))
  }

  async function doLogin(loginData) {
    const res = await login(loginData)
    if (res.code === 200) {
      setToken(res.data.token)
      setUserInfo(res.data)
    }
    return res
  }

  function logout() {
    token.value = ''
    username.value = ''
    userType.value = ''
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userType')
    localStorage.removeItem('permissions')
  }

  return {
    token,
    username,
    userType,
    permissions,
    isLoggedIn,
    isAdmin,
    setToken,
    setUserInfo,
    doLogin,
    logout
  }
})
