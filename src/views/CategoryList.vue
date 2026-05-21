<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">分类管理（两级分类）</span>
          <div>
            <el-button type="primary" @click="openDialog(null, 1)" style="margin-right: 10px">
              <el-icon><Plus /></el-icon> 新增大类
            </el-button>
            <el-button type="success" @click="openDialog(null, 2)" :disabled="!majorCategories.length">
              <el-icon><Plus /></el-icon> 新增小类
            </el-button>
          </div>
        </div>
      </template>

      <!-- 两级分类树形表格 -->
      <el-table
          :data="tableData"
          stripe
          border
          style="width: 100%"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          default-expand-all
      >
        <el-table-column prop="name" label="分类名称" min-width="180">
          <template #default="{ row }">
            <span style="font-weight: bold">{{ row.name }}</span>
            <el-tag v-if="row.level === 1" type="primary" size="small" style="margin-left: 8px">大类</el-tag>
            <el-tag v-else type="info" size="small" style="margin-left: 8px">小类</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="编码" width="150" />
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
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button v-if="row.level === 1" type="success" size="small" @click="openDialog(null, 2, row.id)">添加小类</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <!-- 层级显示 -->
        <el-form-item label="层级">
          <el-radio-group v-model="form.level" :disabled="isEdit">
            <el-radio :label="1">大类（如：香烟、酒水）</el-radio>
            <el-radio :label="2">小类（如：中华系列）</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 所属大类（仅小类显示，从数据库获取大类列表） -->
        <el-form-item label="所属大类" v-if="form.level === 2">
          <el-select v-model="form.parentId" placeholder="选择所属大类" style="width: 100%" :disabled="isEdit">
            <el-option
                v-for="item in majorCategories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="编码">
          <el-input v-model="form.code" placeholder="请输入编码" />
        </el-form-item>

        <!-- 图标（仅大类） -->
        <el-form-item label="图标" v-if="form.level === 1">
          <el-input v-model="form.icon" placeholder="请输入图标URL（可选）" />
        </el-form-item>

        <!-- 类型：大类=输入框自己填，小类=不显示，自动继承父类 -->
        <el-form-item label="类型" v-if="form.level === 1">
          <el-input v-model="form.type" placeholder="请输入类型，如：香烟、酒水、槟榔" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>

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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '@/api/category'

const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('新增分类')
const form = ref({
  name: '',
  code: '',
  type: '',
  sortOrder: 0,
  status: 1,
  level: 1,
  parentId: null,
  icon: ''
})

// 计算属性：获取所有大类（用于小类选择父分类）
const majorCategories = computed(() => {
  const majors = []
  const findMajors = (list) => {
    list.forEach(item => {
      if (item.level === 1) {
        majors.push(item)
      }
      if (item.children && item.children.length > 0) {
        findMajors(item.children)
      }
    })
  }
  findMajors(tableData.value)
  return majors
})

const typeName = (type) => ({
  CIGARETTE: '香烟',
  ALCOHOL: '酒水',
  BEVERAGE: '饮料',
  WATER: '水'
}[type] || type)

const typeTagColor = (type) => ({
  CIGARETTE: 'danger',
  ALCOHOL: 'warning',
  BEVERAGE: 'success',
  WATER: ''
}[type] || 'info')

// 加载树形分类数据
const loadData = async () => {
  const res = await getCategoryTree()
  if (res.code === 200) {
    tableData.value = res.data || []
  }
}

// 打开对话框
const openDialog = (row = null, level = 1, parentId = null) => {
  isEdit.value = !!row

  if (row) {
    // 编辑模式
    dialogTitle.value = '编辑分类'
    form.value = {
      ...row,
      level: row.level || 1,
      parentId: row.parentId || null,
      icon: row.icon || ''
    }
  } else {
    // 新增模式
    dialogTitle.value = level === 1 ? '新增大类' : '新增小类'
    form.value = {
      name: '',
      code: '',
      type: '',
      sortOrder: 0,
      status: 1,
      level: level,
      parentId: parentId,
      icon: ''
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  // 表单验证
  if (!form.value.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  if (!form.value.code) {
    ElMessage.warning('请输入编码')
    return
  }
  // 只有大类需要填写类型
  if (form.value.level === 1 && !form.value.type) {
    ElMessage.warning('请输入类型')
    return
  }
  // 只有小类需要选择所属大类
  if (form.value.level === 2 && !form.value.parentId) {
    ElMessage.warning('请选择所属大类')
    return
  }

  // 小类自动继承父类的类型
  if (form.value.level === 2 && form.value.parentId) {
    const parent = majorCategories.value.find(item => item.id === form.value.parentId)
    if (parent) {
      form.value.type = parent.type
    }
  }

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
  const tip = row.level === 1 && row.children && row.children.length > 0
      ? `确定删除大类「${row.name}」吗？该大类下有 ${row.children.length} 个小类，删除后将无法恢复！`
      : `确定删除分类「${row.name}」吗？`

  ElMessageBox.confirm(tip, '提示', { type: 'warning' }).then(async () => {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadData()
  })
}

onMounted(() => loadData())
</script>