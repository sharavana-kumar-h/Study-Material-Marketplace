import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, listingsAPI } from '../api/api'

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)

      const id = user?.userID || user?.UserID || user?.user_id
      if (!id) return

      const [ordersRes, listingsRes] = await Promise.all([
        ordersAPI.getUserOrders(id),
        listingsAPI.getAll(),
      ])

      // Filter only my listings
      const mine = (listingsRes.data || []).filter(
        (l) => l.SellerID === id
      )

      setOrders(ordersRes.data || [])
      setMyListings(mine || [])

    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Welcome back, {user.Name || user.name}!</p>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'listings'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Listings ({myListings.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center py-12 text-gray-600">No orders yet</p>
              ) : (
                orders.map((order) => (
                  <div key={order.order_id} className="card">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.title}
                        </h3>
                        <p className="text-sm mt-1">
                          Qty: {order.quantity} | ₹{order.price}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded ${
                          statusColors[order.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* LISTINGS */}
          {activeTab === 'listings' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.length === 0 ? (
                <p className="col-span-full text-center text-gray-600">
                  No listings yet
                </p>
              ) : (
                myListings.map((listing) => (
                  <div key={listing.ListingID} className="card">
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center mb-4">
                      <span className="text-4xl">📚</span>
                    </div>

                    <h3 className="font-semibold mb-1">{listing.Title}</h3>
                    <p className="text-sm text-gray-600">{listing.Author}</p>

                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-primary">
                        ₹{listing.Price}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          listing.Status === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {listing.Status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
