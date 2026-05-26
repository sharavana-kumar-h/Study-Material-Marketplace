import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL 
});

// -------------------------
// AUTH API
// -------------------------
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// -------------------------
// LISTINGS API
// -------------------------
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),

  // IMPORTANT: multipart form upload for images
  create: (formData) =>
    api.post('/listings', formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),

  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
};

// -------------------------
// CART API
// -------------------------
export const cartAPI = {
  get: (userId) => api.get(`/cart/${userId}`),
  add: (data) => api.post('/cart/add', data),
  remove: (data) => api.post('/cart/remove', data),
};

// -------------------------
// ORDERS API
// -------------------------
export const ordersAPI = {
  checkout: (data) => api.post('/orders/checkout', data),
  getUserOrders: (userId) => api.get(`/orders/${userId}`),
};

export default api;
