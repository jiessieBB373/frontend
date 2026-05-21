<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">分类管理</span>
          <!-- 【修改】添加 v-if 权限控制 -->
          <el-button v-if="userType === 'MERCHANT' || userType === 'ADMIN'" type="success" @click="openDialog()">
            <el-icon><Plus /></el-icon> 新增分类
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <!-- 关键：把固定 width 改成 min-width，实现自动铺满 -->
        <el-table-column prop="name" label="分类名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="code" label="编码" min-width="200" show-overflow-tooltip />
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
        <el-table-column v-if="userType === 'ADMIN'" prop="merchantName" label="所属商户" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canEdit(row)" type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button v-if="canDelete(row)" type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top: 16px; justify-content: flex-end" background layout="total, prev, pager, next"
                     :total="total" :page-size="pageSize" v-model:current-page="pageNum" @current-change="loadData" />
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
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

const userStore = useUserStore()
const userType = computed(() => userStore.userType)
const tableData = ref([])
const dialogVisible = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const isEdit = ref(false)
const form = ref({ name: '', code: '', type: '', sortOrder: 0, status: 1 })

const typeName = (type) => ({ CIGARETTE: '香烟', BEVERAGE: '饮料', WATER: '矿泉水' }[type] || type)
const typeTagColor = (type) => ({ CIGARETTE: 'danger', BEVERAGE: 'success', WATER: '' }[type] || 'info')

const loadData = async () => {
  // const res = await getCategoryList()
  const res = await getCategoryList({ pageNum: pageNum.value, pageSize: pageSize.value })
  if (res.code === 200) { tableData.value = res.data.records; total.value = res.data.total }
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

const canEdit = (row) => {
  if (userType.value === 'ADMIN') return true
  if (userType.value === 'MERCHANT') return Number(row.merchantId) === Number(userStore.userId)
  return false
}

const canDelete = (row) => canEdit(row)

onMounted(() => loadData())
</script>
