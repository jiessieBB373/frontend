import request from './request'

export const getCustomerList = (params) => request.get('/customers', { params })

export const getAllCustomers = () => request.get('/customers/all')

export const createCustomer = (data) => request.post('/customers', data)

export const updateCustomer = (id, data) => request.put(`/customers/${id}`, data)

export const deleteCustomer = (id) => request.delete(`/customers/${id}`)

export const toggleCustomerStatus = (id, status) => request.put(`/customers/${id}/status?status=${status}`)