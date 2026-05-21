<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">商品管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索商品名称/品牌" style="width: 250px; margin-right: 12px" clearable @clear="loadData" @keyup.enter="loadData">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" @click="loadData"><el-icon><Search /></el-icon> 搜索</el-button>
            <el-button v-if="userType === 'MERCHANT'" type="success" @click="openDialog()"><el-icon><Plus /></el-icon> 新增商品</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="商品名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="code" label="编码" width="110" show-overflow-tooltip />
        <el-table-column prop="brand" label="品牌" width="90" />
        <el-table-column prop="specification" label="规格" width="110" show-overflow-tooltip />
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column prop="retailPrice" label="零售价" width="85">
          <template #default="{ row }">¥{{ row.retailPrice }}</template>
        </el-table-column>
        <el-table-column prop="wholesalePrice" label="批发价" width="85">
          <template #default="{ row }">¥{{ row.wholesalePrice }}</template>
        </el-table-column>
        <el-table-column prop="minQuantity" label="起批" width="65" />
        <el-table-column prop="stock" label="库存" width="65" />
        <el-table-column label="商品图片" width="95">
          <template #default="{ row }">
            <el-image v-if="row.imageUrl" :src="getImageUrl(row.imageUrl)" style="width: 60px; height: 60px" fit="cover" :preview-src-list="[getImageUrl(row.imageUrl)]" preview-teleported />
            <span v-else style="color: #999; font-size: 12px">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="85">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <!-- 所属商户列：管理员显示，自适应宽度 -->
        <el-table-column v-if="userType === 'ADMIN'" prop="merchantName" label="所属商户" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canEdit(row)" type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button v-if="canEdit(row)" type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top: 16px; justify-content: flex-end" background layout="total, prev, pager, next"
                     :total="total" :page-size="pageSize" v-model:current-page="pageNum" @current-change="loadData" />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="商品名称"><el-input v-model="form.name" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品编码"><el-input v-model="form.code" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="品牌"><el-input v-model="form.brand" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="规格"><el-input v-model="form.specification" placeholder="如: 20支/包" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位"><el-input v-model="form.unit" placeholder="包/瓶/箱" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="零售价"><el-input-number v-model="form.retailPrice" :min="0" :precision="2" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="批发价"><el-input-number v-model="form.wholesalePrice" :min="0" :precision="2" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="起批数量"><el-input-number v-model="form.minQuantity" :min="1" style="width: 100%" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="上架" inactive-text="下架" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="商品图片">
          <el-upload
              class="product-uploader"
              action="/api/upload/image"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              accept="image/*"
              name="file"
          >
            <el-image v-if="form.imageUrl" :src="getImageUrl(form.imageUrl)" fit="cover" style="width: 120px; height: 120px; border: 1px dashed #d9d9d9; border-radius: 6px" />
            <div v-else style="width: 120px; height: 120px; border: 1px dashed #d9d9d9; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; cursor: pointer">
              <el-icon :size="30"><Plus /></el-icon>
              <span style="font-size: 12px; margin-top: 4px">上传图片</span>
            </div>
          </el-upload>
          <div style="font-size: 12px; color: #999; margin-top: 4px">支持 JPG/PNG，最大 5MB</div>
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
import { getProductList, createProduct, updateProduct, deleteProduct } from '@/api/product'
import { getCategoryList, getAllCategories  } from '@/api/category'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

const userStore = useUserStore()
const userType = computed(() => userStore.userType)
const keyword = ref('')
const tableData = ref([])
const categories = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ name: '', code: '', brand: '', categoryId: null, specification: '', unit: '包', retailPrice: 0, wholesalePrice: 0, minQuantity: 1, stock: 0, status: 1, description: '', imageUrl: '' })

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return 'http://localhost:8080' + url
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) { ElMessage.error('只能上传图片文件'); return false }
  if (!isLt5M) { ElMessage.error('图片大小不能超过5MB'); return false }
  return true
}

const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    form.value.imageUrl = response.data
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const loadData = async () => {
  const res = await getProductList({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value })
  if (res.code === 200) { tableData.value = res.data.records; total.value = res.data.total }
}

// 【修改】商品列表页面用分页接口
const loadCategories = async () => {
  const res = await getAllCategories()
  if (res.code === 200) categories.value = res.data.records || []
}

// 【新增】新增/编辑商品弹窗用（不分页）
const loadCategoriesForDialog = async () => {
  const res = await getAllCategories()
  if (res.code === 200) categories.value = res.data || []
}

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row ? { ...row } : { name: '', code: '', brand: '', categoryId: null, specification: '', unit: '包', retailPrice: 0, wholesalePrice: 0, minQuantity: 1, stock: 0, status: 1, description: '' }
  dialogVisible.value = true
  loadCategoriesForDialog()
}

const handleSubmit = async () => {
  if (isEdit.value) {
    await updateProduct(form.value.id, form.value)
    ElMessage.success('更新成功')
  } else {
    await createProduct(form.value)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除商品「${row.name}」吗？`, '提示', { type: 'warning' }).then(async () => {
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadData()
  })
}

// 【新增】权限判断方法
const canEdit = (row) => {
  if (userType.value === 'ADMIN') return true
  if (userType.value === 'MERCHANT') return Number(row.merchantId) === Number(userStore.userId)
  return false
}

const canDelete = (row) => canEdit(row)

onMounted(() => { loadData(); loadCategories() })
</script>
