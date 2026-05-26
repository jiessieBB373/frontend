<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">订单管理</span>
          <div style="display: flex; align-items: center">
            <!-- 模糊搜索 -->
            <el-input v-model="keyword" placeholder="搜索订单编号/客户名称" style="width: 220px; margin-right: 12px" clearable @clear="loadData" @keyup.enter="loadData">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <!-- 商户筛选（仅管理员） -->
            <el-select v-if="userType === 'ADMIN'" v-model="merchantFilter" placeholder="筛选商户" clearable style="width: 150px; margin-right: 12px" @change="loadData">
              <el-option v-for="m in merchantList" :key="m.id" :label="m.shopName || m.username" :value="m.id" />
            </el-select>
            <!-- 订单状态 -->
            <el-select v-model="statusFilter" placeholder="订单状态" clearable style="width: 150px" @change="loadData">
              <el-option label="待处理" value="PENDING" />
              <el-option label="已确认" value="CONFIRMED" />
              <el-option label="配送中" value="DELIVERING" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="merchantName" label="商户" width="120" />
        <el-table-column v-if="userType === 'MERCHANT'" prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="totalAmount" label="订单金额" width="100">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="discountAmount" label="优惠" width="80">
          <template #default="{ row }">¥{{ row.discountAmount || 0 }}</template>
        </el-table-column>
        <el-table-column prop="payAmount" label="实付金额" width="100">
          <template #default="{ row }"><b>¥{{ row.payAmount }}</b></template>
        </el-table-column>
        <el-table-column prop="statusName" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payStatusName" label="支付状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.payStatus === 'PAID' ? 'success' : 'warning'" size="small">{{ row.payStatusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" width="80" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        <el-table-column prop="createTime" label="下单时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-select v-if="row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && userType === 'MERCHANT'" v-model="nextStatus" size="small" style="width: 90px; margin-left: 4px" placeholder="操作" @change="handleStatusChange(row)">
              <el-option v-if="row.status === 'PENDING'" label="确认" value="CONFIRMED" />
              <el-option v-if="row.status === 'CONFIRMED'" label="发货" value="DELIVERING" />
              <el-option v-if="row.status === 'DELIVERING'" label="完成" value="COMPLETED" />
              <el-option label="取消" value="CANCELLED" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top: 16px; justify-content: flex-end" background layout="total, prev, pager, next"
        :total="total" :page-size="pageSize" v-model:current-page="pageNum" @current-change="loadData" />
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="700px">
      <template v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="商户">{{ currentOrder.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="实付金额"><b>¥{{ currentOrder.payAmount }}</b></el-descriptions-item>
          <el-descriptions-item label="订单状态">{{ currentOrder.statusName }}</el-descriptions-item>
          <el-descriptions-item label="支付状态">{{ currentOrder.payStatusName }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentOrder.contactName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="配送地址" :span="2">{{ currentOrder.deliveryAddress }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 16px 0 8px">商品明细</h4>
        <el-table :data="currentOrder.items || []" border size="small">
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="specification" label="规格" width="100" />
          <el-table-column prop="unitPrice" label="单价" width="80">
            <template #default="{ row }">¥{{ row.unitPrice }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="70" />
          <el-table-column prop="subtotal" label="小计" width="90">
            <template #default="{ row }">¥{{ row.subtotal }}</template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderList, getOrderDetail, updateOrderStatus, cancelOrder } from '@/api/order'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

const userStore = useUserStore()
const userType = computed(() => userStore.userType)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const keyword = ref('')
const merchantFilter = ref(null)
const merchantList = ref([])
const nextStatus = ref('')
const detailVisible = ref(false)
const currentOrder = ref(null)

const loadMerchants = async () => {
  if (userType.value === 'ADMIN') {
    const res = await getAllMerchants()
    if (res.code === 200) {
      merchantList.value = res.data || []
    }
  }
}

const statusTagType = (status) => {
  const map = { PENDING: 'warning', CONFIRMED: 'primary', DELIVERING: '', COMPLETED: 'success', CANCELLED: 'danger' }
  return map[status] || 'info'
}

const loadData = async () => {
  const params = { pageNum: pageNum.value, pageSize: pageSize.value }
  if (statusFilter.value) params.status = statusFilter.value
  if (keyword.value) params.keyword = keyword.value
  if (merchantFilter.value) params.adminMerchantId  = merchantFilter.value
  const res = await getOrderList(params)
  if (res.code === 200) { tableData.value = res.data.records; total.value = res.data.total }
}

const viewDetail = async (row) => {
  const res = await getOrderDetail(row.id)
  if (res.code === 200) { currentOrder.value = res.data; detailVisible.value = true }
}

const handleStatusChange = async (row) => {
  if (nextStatus.value === 'CANCELLED') {
    await cancelOrder(row.id)
  } else {
    await updateOrderStatus(row.id, nextStatus.value)
  }
  ElMessage.success('操作成功')
  nextStatus.value = ''
  loadData()
}

onMounted(() => loadData())
</script>
