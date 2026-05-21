import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/ProductList.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrderList.vue'),
        meta: { title: '订单管理', icon: 'Document' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/CategoryList.vue'),
        meta: { title: '分类管理', icon: 'Grid' }
      },
      {
        path: 'merchants',
        name: 'Merchants',
        component: () => import('@/views/MerchantList.vue'),
        meta: { title: '商户管理', icon: 'User', requiresAdmin: true }
      },
      {
        path: '/customers',
        name: 'CustomerList',
        component: () => import('@/views/CustomerList.vue'),
        meta: { title: '客户管理', icon: 'User' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth !== false && !userStore.token) {
    next('/login')
  } else if (to.path === '/login' && userStore.token) {
    next('/dashboard')
  } else if (to.meta.requiresAdmin && userStore.userType !== 'ADMIN') {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
