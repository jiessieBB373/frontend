import request from './request'

// 【修改】商品列表页面用（分页）
export function getCategoryList(params) {
  return request.get('/categories', { params })
}

// 【新增】新增商品弹窗用（不分页，返回数组）
export function getAllCategories() {
  return request.get('/categories/all')
}

export function getCategoriesByType(type) {
  return request.get(`/categories/type/${type}`)
}

export function createCategory(data) {
  return request.post('/categories', data)
}

export function updateCategory(id, data) {
  return request.put(`/categories/${id}`, data)
}

export function deleteCategory(id) {
  return request.delete(`/categories/${id}`)
}
