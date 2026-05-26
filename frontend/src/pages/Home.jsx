import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Study Material Marketplace</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Buy and sell used textbooks with your fellow students. Save money, help the environment,
            and connect with your campus community.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/listings" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Browse Textbooks
            </Link>

            {user ? (
              <Link to="/add-listing" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition">
                Sell Your Books
              </Link>
            ) : (
              <Link to="/register" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose BookSwap?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Save Money</h3>
            <p className="text-gray-600">
              Buy used textbooks at a fraction of the retail price. Sell your books when you're done with them.
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-4">♻️</div>
            <h3 className="text-xl font-semibold mb-2">Go Green</h3>
            <p className="text-gray-600">
              Reduce waste and help the environment by giving textbooks a second life.
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Campus Community</h3>
            <p className="text-gray-600">
              Connect with fellow students and support your campus community.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of students already saving money on textbooks.
          </p>
          <Link to={user ? "/listings" : "/register"} className="btn-primary text-lg px-8 py-3">
            {user ? "Browse Listings" : "Sign Up Now"}
          </Link>
        </div>
      </div>
    </div>
  )
}
