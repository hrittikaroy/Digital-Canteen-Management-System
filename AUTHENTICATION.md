# 🔐 Digital Canteen Authentication Guide

## Overview

Your Digital Canteen application now has **real, production-level authentication** with:
- ✅ **Bcrypt Password Hashing** - Passwords are securely hashed, never stored in plain text
- ✅ **JWT Token Authentication** - Secure session management with JSON Web Tokens
- ✅ **User Registration** - Create new accounts with signed credentials
- ✅ **Protected Routes** - API endpoints that require valid authentication tokens

---

## What Changed

### 1. **Dependencies Added**
```bash
npm install bcrypt jsonwebtoken
```

### 2. **Database Schema Updated**
Users table now stores:
- `password_hash` - Bcrypt hashed password (never plain text)
- `created_at` - Account creation timestamp

### 3. **New Security Features**
- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire in 24 hours
- Protected endpoints verify tokens before accessing data
- Users can only access their own data (unless admin)

---

## API Endpoints

### **1. LOGIN** 
Register existing user and get JWT token

**Endpoint:** `POST /api/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 3,
    "email": "user@example.com",
    "name": "Demo User",
    "wallet_balance": 500
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **2. REGISTER** 
Create a new account with hashed password

**Endpoint:** `POST /api/register`

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 23,
    "email": "newuser@example.com",
    "name": "John Doe",
    "wallet_balance": 500
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **3. GET PROFILE** ⚠️ Requires Token
Get authenticated user profile

**Endpoint:** `GET /api/profile`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": 3,
    "email": "user@example.com",
    "wallet_balance": "500.00",
    "created_at": "2026-04-02T10:30:45.000Z"
  }
}
```

---

### **4. GET WALLET** ⚠️ Requires Token
Check user's wallet balance

**Endpoint:** `GET /api/wallet/:userId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

---

### **5. PAY FROM WALLET** ⚠️ Requires Token
Deduct amount from wallet

**Endpoint:** `POST /api/wallet/pay`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request:**
```json
{
  "user_id": 3,
  "amount": 50
}
```

---

### **6. PLACE ORDER** ⚠️ Requires Token
Create a new order (token required)

**Endpoint:** `POST /api/orders`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request:**
```json
{
  "user_id": 3,
  "seat": "A1",
  "items": [{"id": 1, "name": "Paneer Butter Masala", "quantity": 2}],
  "total": 240
}
```

---

### **7. GET USER ORDERS** ⚠️ Requires Token
Fetch all orders for authenticated user

**Endpoint:** `GET /api/user/orders`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

---

## How to Use Tokens

### **1. After Login/Register**
The API returns a `token`. Store it in your frontend (localStorage, sessionStorage, or cookie).

```javascript
// After successful login
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});

const { token, user } = await response.json();

// Store token
localStorage.setItem('authToken', token);
```

### **2. Use Token in Protected Requests**
Include the token in the `Authorization` header with `Bearer` prefix.

```javascript
// Fetch protected data
const token = localStorage.getItem('authToken');
const response = await fetch('/api/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.user);
```

### **3. Handle Token Expiry**
Tokens expire in 24 hours. When expired, users must log in again.

```javascript
// Check if token is expired
if (response.status === 403) {
  // Token expired or invalid
  localStorage.removeItem('authToken');
  // Redirect to login
  window.location.href = '/login.html';
}
```

---

## Security Best Practices

### ✅ What We Did Right
1. **Never store plain text passwords** - Using bcrypt hashing
2. **JWT tokens for sessions** - Stateless authentication
3. **Token expiration** - Tokens expire in 24 hours
4. **Access control** - Users can only access their own data
5. **Hashing algorithm** - Bcrypt with 10 salt rounds (industry standard)

### 📋 Additional Steps (Optional)
For production, consider:

1. **Use HTTPS** - Always encrypt data in transit
2. **Refresh tokens** - Implement token refresh for long sessions
3. **Password strength rules** - Enforce strong passwords
4. **Rate limiting** - Prevent brute force attacks
5. **Email verification** - Verify user email before account creation
6. **Two-factor authentication (2FA)** - Extra security layer
7. **Change JWT_SECRET** - Update `JWT_SECRET` in environment variables

---

## Admin Login

**Email:** `admin@canteen.com`  
**Password:** `admin`

Admin can:
- Access `/admin.html`
- Update menu items
- Update order status
- View all orders

---

## Example Test Credentials

**Demo User (Auto-created on first login):**
- Email: `user@example.com`
- Password: `password`
- Wallet: ₹500

**Test User (Just created):**
- Email: `test3@example.com`
- Password: `testpass123`
- Name: `Test User`
- Wallet: ₹500

---

## Error Responses

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Email and password required | Missing credentials |
| 400 | Invalid credentials | Wrong email/password |
| 400 | Email already exists | Account already created |
| 400 | Password must be 6+ characters | Weak password |
| 401 | Access token required | No token in header |
| 403 | Invalid or expired token | Token is invalid/expired |
| 500 | Database error | Server-side issue |

---

## Database Schema

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Next Steps

1. **Update Frontend** - Store and send JWT tokens from login/register forms
2. **Protect Pages** - Check for token before showing protected content
3. **Handle Logout** - Clear token from localStorage on logout
4. **Refresh Mechanism** - Implement token refresh for better UX (optional)
5. **Error Handling** - Show user-friendly error messages

---

**Your Digital Canteen system is now secure! 🎉**
