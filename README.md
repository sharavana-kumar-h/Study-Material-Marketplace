# Study Material Marketplace

## File Structure

```text
Study-Material-Marketplace/
├── backend/                             # Express.js backend
│   ├── config/
│   │   └── db.js                        # MySQL connection pool
│   ├── controllers/                     # Business logic
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── routes/                          # API routes
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── middleware/
│   │   └── auth.js                      # Authentication middleware
│   ├── package.json
│   ├── .env
│   └── server.js                        # Application entry point
│
├── frontend/                            # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js                   # Axios configuration
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Listings.jsx
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── AddListing.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ListingCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── CartItem.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Authentication state management
│   │   │   └── CartContext.jsx          # Cart state management
│   │   ├── App.jsx                      # Route definitions
│   │   └── main.jsx                     # React entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── database/
│   ├── schema.sql                       # Database schema
│   └── functions.sql                    # Stored procedures/functions
│
├── README.md                            # Project documentation
├── deployment-guide.md                  # Deployment instructions
└── backend-setup-guide.md               # Backend setup guide
```
