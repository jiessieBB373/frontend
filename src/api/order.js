import request from './request'

export function getOrderList(params) {
  return request.get('/orders', { params })
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`)
}

export function createOrder(data) {
  return request.post('/orders', data)
}

export function updateOrderStatus(id, status) {
  return request.put(`/orders/${id}/status?status=${status}`)
}

export function cancelOrder(id) {
  return request.put(`/orders/${id}/cancel`)
}

export function getRecentOrders() {
  return request.get('/orders/recent')
}
