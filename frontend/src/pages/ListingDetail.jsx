import React,{ useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listingsAPI } from '../api/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const response = await listingsAPI.getById(id)
      setListing(response.data)
    } catch (error) {
      console.error('Failed to fetch listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart')
      navigate('/login')
      return
    }

    if (user.UserID === listing.seller_id) {
      alert('You cannot buy your own listing')
      return
    }

    const result = await addToCart(listing, quantity)
    if (result.success) {
      alert('Added to cart!')
      navigate('/cart')
    } else {
      alert(result.error || 'Failed to add to cart')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Listing not found</p>
      </div>
    )
  }

  const conditionColors = {
    'New': 'bg-green-100 text-green-800',
    'Like New': 'bg-blue-100 text-blue-800',
    'Good': 'bg-yellow-100 text-yellow-800',
    'Fair': 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/listings')}
        className="text-primary hover:underline mb-6 flex items-center gap-2"
      >
        ← Back to Listings
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-96 flex items-center justify-center">
          <span className="text-9xl">📖</span>
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {listing.title || listing.book_title}
          </h1>
          
          <div className="space-y-3 mb-6">
            <p className="text-gray-700">
              <span className="font-semibold">Author:</span> {listing.author}
            </p>
            {listing.edition && (
              <p className="text-gray-700">
                <span className="font-semibold">Edition:</span> {listing.edition}
              </p>
            )}
            {listing.course_code && (
              <p className="text-gray-700">
                <span className="font-semibold">Course:</span> {listing.course_code}
              </p>
            )}
            <p className="text-gray-700">
              <span className="font-semibold">Condition:</span>{' '}
              <span className={`px-2 py-1 rounded text-sm ${conditionColors[listing.condition]}`}>
                {listing.condition}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Available Quantity:</span> {listing.quantity}
            </p>
          </div>

          {listing.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{listing.description}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold text-primary">₹{listing.price}</span>
              {listing.status !== 'Available' && (
                <span className="text-red-600 font-semibold">SOLD OUT</span>
              )}
            </div>

            {listing.status === 'Available' && user?.UserID !== listing.seller_id && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={listing.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input-field w-24"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full btn-primary text-lg py-3"
                >
                  Add to Cart
                </button>
              </div>
            )}

            {user?.UserID === listing.seller_id && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                This is your listing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
