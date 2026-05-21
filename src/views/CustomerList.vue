<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">客户管理</span>
          <el-button type="success" @click="openDialog()"><el-icon><Plus /></el-icon> 新增客户</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="登录账号" width="120" />
        <el-table-column prop="realName" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="shopAddress" label="收货地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" size="small" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top: 16px; justify-content: flex-end" background layout="total, prev, pager, next"
                     :total="total" :page-size="pageSize" v-model:current-page="pageNum" @current-change="loadData" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '新增客户'" width="500px" destroy-on-close>
      <el-form :model="form" label-width="90px">
        <el-form-item label="登录账号" v-if="!isEdit">
          <el-input v-model="form.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="登录密码" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="form.realName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="form.address" type="textarea" :rows="3" placeholder="请输入收货地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCustomerList, createCustomer, updateCustomer, deleteCustomer, toggleCustomerStatus } from '@/api/customer'
import { useUserStore } from '@/stores/user'
import request from '@/api/request'

const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ name: '', phone: '', address: '', status: 1 })
const userStore = useUserStore()

const loadData = async () => {
  const res = await getCustomerList({ pageNum: pageNum.value, pageSize: pageSize.value })
  if (res.code === 200) {
    tableData.value = res.data.records
    total.value = res.data.total
  }
}

const openDialog = (row) => {
  isEdit.value = !!row
  if (row) {
    form.value = {  id: row.id, realName: row.realName || '', phone: row.phone || '', address: row.shopAddress || '' }
  } else {
    form.value = { username: '', password: '', realName: '', phone: '', address: '' }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!isEdit.value && (!form.value.username || !form.value.password)) {
    ElMessage.warning('请填写登录账号和密码')
    return
  }
  if (isEdit.value) {
    await updateCustomer(form.value.id, { realName: form.value.realName, phone: form.value.phone, shopAddress: form.value.address })
    ElMessage.success('更新成功')
  } else {
    await createCustomer(form.value)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await request.put(`/customers/${row.id}/status?status=${newStatus}`)
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除客户「${row.realName}」吗？`, '提示', { type: 'warning' }).then(async () => {
    await deleteCustomer(row.id)
    ElMessage.success('删除成功')
    loadData()
  })
}

onMounted(() => loadData())
</script>