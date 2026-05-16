<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">分类管理</span>
          <el-button type="success" @click="openDialog()"><el-icon><Plus /></el-icon> 新增分类</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="分类名称" width="160" />
        <el-table-column prop="code" label="编码" width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeTagColor(row.type)" size="small">{{ typeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="450px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="选择类型" style="width: 100%">
            <el-option label="香烟" value="CIGARETTE" />
            <el-option label="饮料" value="BEVERAGE" />
            <el-option label="矿泉水" value="WATER" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
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
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'

const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ name: '', code: '', type: '', sortOrder: 0, status: 1 })

const typeName = (type) => ({ CIGARETTE: '香烟', BEVERAGE: '饮料', WATER: '矿泉水' }[type] || type)
const typeTagColor = (type) => ({ CIGARETTE: 'danger', BEVERAGE: 'success', WATER: '' }[type] || 'info')

const loadData = async () => {
  const res = await getCategoryList()
  if (res.code === 200) tableData.value = res.data
}

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row ? { ...row } : { name: '', code: '', type: '', sortOrder: 0, status: 1 }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (isEdit.value) {
    await updateCategory(form.value.id, form.value)
    ElMessage.success('更新成功')
  } else {
    await createCategory(form.value)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '提示', { type: 'warning' }).then(async () => {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadData()
  })
}

onMounted(() => loadData())
</script>
