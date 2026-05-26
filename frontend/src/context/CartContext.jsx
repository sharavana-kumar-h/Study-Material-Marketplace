import React,{ createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { cartAPI } from '../api/api'

const CartContext = createContext()

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCartItems([])
    }
  }, [user])

  const fetchCart = async () => {
    if (!user) return

    const id = user?.userID || user?.UserID || user?.user_id
    console.debug('Cart fetch user id:', id)
    if (!id) {
      console.warn('No user id available for cart fetch — skipping request')
      setCartItems([])
      return
    }

    try {
      setLoading(true)
      const response = await cartAPI.get(id)
      setCartItems(response.data || [])
    } catch (error) {
      // Print server response body (if any), HTTP status, and fallback message
      console.error('Failed to fetch cart:', error.response?.data ?? error.message ?? error)

      // Helpful debug info
      console.debug('Cart fetch attempted for id:', id)
      if (error.response) {
        console.debug('Response status:', error.response.status, 'headers:', error.response.headers)
      } else {
        console.debug('No response received (network error or CORS).')
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (listing, quantity = 1) => {
    if (!user) {
      return { success: false, error: 'Please login first' }
    }

    try {
      await cartAPI.add({
        userID: user.userID || user.UserID || user.user_id,
        listingID: listing.listing_id || listing.ListingID || listing.listingID,
        quantity,
      })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to add to cart' }
    }
  }

  const removeFromCart = async (listingId) => {
    if (!user) return

    try {
      await cartAPI.remove({
        userID: user.userID || user.UserID || user.user_id,
        listingID: listingId,
      })
      await fetchCart()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)

  const value = {
    cartItems,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    fetchCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
