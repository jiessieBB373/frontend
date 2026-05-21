<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409EFF">
            <el-icon :size="30"><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.productCount }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67C23A">
            <el-icon :size="30"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #E6A23C">
            <el-icon :size="30"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingCount }}</div>
            <div class="stat-label">待处理订单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" v-if="userStore.isAdmin">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #F56C6C">
            <el-icon :size="30"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.merchantCount }}</div>
            <div class="stat-label">商户数量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span style="font-weight: bold">最近订单</span>
          </template>
          <el-table :data="recentOrders" stripe style="width: 100%" max-height="400">
            <el-table-column prop="orderNo" label="订单编号" width="180" />
            <el-table-column prop="merchantName" label="商户" width="120" />
            <el-table-column prop="totalAmount" label="金额" width="100">
              <template #default="{ row }">¥{{ row.payAmount }}</template>
            </el-table-column>
            <el-table-column prop="statusName" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">{{ row.statusName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="下单时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span style="font-weight: bold">快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/products')" style="width: 100%; margin-bottom: 12px">
              <el-icon><Goods /></el-icon> 商品管理
            </el-button>
            <el-button type="success" size="large" @click="$router.push('/orders')" style="width: 100%; margin-bottom: 12px">
              <el-icon><Document /></el-icon> 订单管理
            </el-button>
            <el-button type="warning" v-if="userType === 'MERCHANT' || userType === 'ADMIN'" size="large" @click="$router.push('/categories')" style="width: 100%; margin-bottom: 12px">
              <el-icon><Grid /></el-icon> 分类管理
            </el-button>
            <el-button v-if="userStore.isAdmin" type="danger" size="large" @click="$router.push('/merchants')" style="width: 100%">
              <el-icon><User /></el-icon> 商户管理
            </el-button>
            <el-button v-if="userType === 'MERCHANT' || userType === 'ADMIN'" type="danger" size="large" @click="$router.push('/customers')" style="width: 100%">
              <el-icon><User /></el-icon> 客户管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getProductList } from '@/api/product'
import { getOrderList } from '@/api/order'
import request from '@/api/request'
import { computed } from 'vue'

const userStore = useUserStore()
const userType = computed(() => userStore.userType)

const stats = ref({
  productCount: 0,
  orderCount: 0,
  pendingCount: 0,
  merchantCount: 0
})

const recentOrders = ref([])

const statusTagType = (status) => {
  const map = { PENDING: 'warning', CONFIRMED: 'primary', DELIVERING: '', COMPLETED: 'success', CANCELLED: 'danger' }
  return map[status] || 'info'
}

onMounted(async () => {
  try {
    const [productRes, orderRes] = await Promise.all([
      getProductList({ pageNum: 1, pageSize: 1 }),
      getOrderList({ pageNum: 1, pageSize: 10 })
    ])
    if (productRes.code === 200) stats.value.productCount = productRes.data.total
    if (orderRes.code === 200) {
      stats.value.orderCount = orderRes.data.total
      recentOrders.value = orderRes.data.records || []
    }
    if (userStore.isAdmin) {
      const merchantRes = await request.get('/merchants', { params: { pageNum: 1, pageSize: 1 } })
      if (merchantRes.code === 200) stats.value.merchantCount = merchantRes.data.total
    }
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
})
</script>

<style scoped>
.stat-card { display: flex; align-items: center; padding: 10px; }
.stat-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; margin-right: 16px; flex-shrink: 0; }
.stat-info { flex: 1; }
.stat-value { font-size: 28px; font-weight: bold; color: #303133; }
.stat-label { font-size: 14px; color: #909399; margin-top: 4px; }
.quick-actions { display: flex; flex-direction: column; }
</style>
