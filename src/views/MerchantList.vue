<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">商户管理</span>
          <el-button type="success" @click="openDialog()"><el-icon><Plus /></el-icon> 新增商户</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="100" />
        <el-table-column prop="realName" label="姓名" width="90" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="shopName" label="店铺名称" width="140" />
        <el-table-column prop="shopAddress" label="店铺地址" min-width="180" />
        <el-table-column prop="businessLicense" label="营业执照" width="130" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" size="small" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top: 16px; justify-content: flex-end" background layout="total, prev, pager, next"
        :total="total" :page-size="pageSize" v-model:current-page="pageNum" @current-change="loadData" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商户' : '新增商户'" width="550px" destroy-on-close>
      <el-form :model="form" label-width="90px">
        <el-form-item label="用户名"><el-input v-model="form.username" :disabled="isEdit" /></el-form-item>
        <el-form-item v-if="!isEdit" label="密码"><el-input v-model="form.password" type="password" show-password /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="店铺名称"><el-input v-model="form.shopName" /></el-form-item>
        <el-form-item label="店铺地址"><el-input v-model="form.shopAddress" /></el-form-item>
        <el-form-item label="营业执照"><el-input v-model="form.businessLicense" /></el-form-item>
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
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ username: '', password: '', realName: '', phone: '', email: '', shopName: '', shopAddress: '', businessLicense: '' })

const loadData = async () => {
  const res = await request.get('/merchants', { params: { pageNum: pageNum.value, pageSize: pageSize.value } })
  if (res.code === 200) { tableData.value = res.data.records; total.value = res.data.total }
}

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row ? { ...row } : { username: '', password: '', realName: '', phone: '', email: '', shopName: '', shopAddress: '', businessLicense: '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (isEdit.value) {
    await request.put(`/merchants/${form.value.id}`, form.value)
    ElMessage.success('更新成功')
  } else {
    await request.post('/merchants', form.value)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  await request.put(`/merchants/${row.id}/status?status=${newStatus}`)
  ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
  loadData()
}

onMounted(() => loadData())
</script>
