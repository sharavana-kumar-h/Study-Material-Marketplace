import React,{ createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const normalizeUser = (data) => {
    return {
      userID: data.userID || data.UserID,
      name: data.name || data.Name,
      email: data.email || data.Email,
      departmentID: data.departmentID || data.DepartmentID
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const userData = normalizeUser(response.data.user)

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const register = async (name, email, password, DepartmentID) => {
    try {
      const response = await authAPI.register({ name, email, password, DepartmentID })
      const userData = normalizeUser(response.data.user)

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
