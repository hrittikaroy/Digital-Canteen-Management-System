# 💰 Smart Wallet System - Complete Guide

## Overview

Your Digital Canteen now has an **industry-level smart wallet system** with:
- ✅ **Transaction History** - Track every rupee with detailed logs
- ✅ **Wallet Recharge** - Users can add money to their wallet
- ✅ **Refund System** - Automatic refunds when orders are cancelled
- ✅ **Transaction Tracking** - Full audit trail with timestamps
- ✅ **Wallet Summary** - Total credits and debits analytics

---

## Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  status ENUM('completed', 'pending', 'failed', 'refunded') DEFAULT 'completed',
  description VARCHAR(255),
  reference_type VARCHAR(50),        -- 'order', 'refund', 'recharge', 'payment'
  reference_id INT,                   -- Links to order ID for context
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### What Each Field Means

| Field | Description |
|-------|-------------|
| `type` | **credit** = money added, **debit** = money spent |
| `status` | completed, pending, failed, or refunded |
| `description` | What happened (e.g., "Order#5 - Food purchase") |
| `reference_type` | Transaction category (order/refund/recharge/payment) |
| `reference_id` | ID of the order (if applicable) for tracking |

---

## API Endpoints

### 1️⃣ **Get Wallet Balance**

**Endpoint:** `GET /api/wallet/:userId`
⚠️ **Requires Token**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 3,
    "email": "user@example.com",
    "name": "Demo User",
    "wallet_balance": "600.00"
  }
}
```

---

### 2️⃣ **Recharge Wallet**

Add money to wallet (credit transaction)

**Endpoint:** `POST /api/wallet/recharge`
⚠️ **Requires Token**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "user_id": 3,
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "new_balance": 1100.00,
  "message": "Recharged ₹500 successfully"
}
```

**Transaction Created:**
- Type: **CREDIT**
- Reference Type: `recharge`
- Description: "Wallet recharge"

---

### 3️⃣ **Get Transaction History**

View all wallet transactions for a user

**Endpoint:** `GET /api/wallet/history/:userId`
⚠️ **Requires Token**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": 3,
      "user_id": 3,
      "amount": "150.00",
      "type": "credit",
      "status": "completed",
      "description": "Refund for Order#1 - Changed my mind",
      "reference_type": "refund",
      "reference_id": 1,
      "created_at": "2026-04-02T18:05:30.000Z",
      "updated_at": "2026-04-02T18:05:30.000Z"
    },
    {
      "id": 2,
      "user_id": 3,
      "amount": "150.00",
      "type": "debit",
      "status": "completed",
      "description": "Order#1 - Food purchase",
      "reference_type": "order",
      "reference_id": 1,
      "created_at": "2026-04-02T18:04:20.000Z",
      "updated_at": "2026-04-02T18:04:20.000Z"
    },
    {
      "id": 1,
      "user_id": 3,
      "amount": "100.00",
      "type": "credit",
      "status": "completed",
      "description": "Wallet recharge",
      "reference_type": "recharge",
      "reference_id": null,
      "created_at": "2026-04-02T18:01:36.000Z",
      "updated_at": "2026-04-02T18:01:36.000Z"
    }
  ],
  "count": 3
}
```

---

### 4️⃣ **Get Wallet Summary**

View wallet analytics and totals

**Endpoint:** `GET /api/wallet/summary/:userId`
⚠️ **Requires Token**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "current_balance": "450.00",
  "total_credited": "250.00",
  "total_debited": "150.00"
}
```

**What it shows:**
- `current_balance` - Money available right now
- `total_credited` - Total money added (recharge + refunds)
- `total_debited` - Total money spent (orders)

---

### 5️⃣ **Place Order with Wallet Payment**

Deduct from wallet when placing order

**Endpoint:** `POST /api/orders`
⚠️ **Requires Token**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "user_id": 3,
  "seat_number": "B5",
  "total_amount": 150,
  "payment_method": "wallet"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": 1,
  "message": "Order placed successfully"
}
```

**Transaction Created:**
- Type: **DEBIT**
- Reference Type: `order`
- Description: "Order#1 - Food purchase"

---

### 6️⃣ **Cancel Order & Get Refund**

Refund order payment back to wallet

**Endpoint:** `POST /api/orders/:orderId/cancel`
⚠️ **Requires Token**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled and refunded to wallet",
  "refunded_amount": "150.00"
}
```

**Transaction Created:**
- Type: **CREDIT**
- Reference Type: `refund`
- Description: "Refund for Order#1 - Changed my mind"

---

### 7️⃣ **Spend from Wallet**

General payment/debit from wallet

**Endpoint:** `POST /api/wallet/pay`
⚠️ **Requires Token**

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "user_id": 3,
  "amount": 100,
  "description": "Vending machine purchase"
}
```

**Response:**
```json
{
  "success": true,
  "new_balance": 350.00,
  "message": "Payment successful"
}
```

**Transaction Created:**
- Type: **DEBIT**
- Reference Type: `payment`
- Description: "Vending machine purchase"

---

## Transaction Types & Reference

### Credit (Money Added) 💰
- **Recharge**: User adds money via `/api/wallet/recharge`
- **Refund**: Order cancelled, money returned
- **Admin Credit**: Manual credit by admin

### Debit (Money Spent) 💸
- **Order**: Food order payment
- **Payment**: Direct wallet debit
- **Fine/Deduction**: Manual debit by admin

---

## Workflow Examples

### Example 1: Order with Refund

```
Initial Balance: ₹500

1. RECHARGE: User adds ₹100
   Balance: ₹600
   
2. PLACE ORDER: Food costs ₹150
   Balance: ₹450
   Transaction: DEBIT, "Order#1 - Food purchase"
   
3. CANCEL ORDER: User cancels
   Balance: ₹600  
   Transaction: CREDIT, "Refund for Order#1 - Changed my mind"
```

### Example 2: Multiple Transactions

```
1. Start: ₹500
2. Recharge: +₹200 = ₹700
3. Order#1: -₹120 = ₹580  
4. Order#2: -₹200 = ₹380
5. Refund Order#2: +₹200 = ₹580
6. Recharge: +₹300 = ₹880

Transaction History:
- CREDIT: ₹300 (Recharge)
- CREDIT: ₹200 (Refund Order#2)
- DEBIT: ₹200 (Order#2)
- DEBIT: ₹120 (Order#1)
- CREDIT: ₹200 (Recharge)
```

---

## Frontend Integration

### 1. Display Wallet Balance
```javascript
const response = await fetch(`/api/wallet/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { user } = await response.json();
console.log('Balance:', user.wallet_balance);
```

### 2. Show Transaction History
```javascript
const response = await fetch(`/api/wallet/history/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { transactions } = await response.json();

// Display table
transactions.forEach(tx => {
  console.log(`${tx.type}: ₹${tx.amount} - ${tx.description}`);
});
```

### 3. Recharge Wallet
```javascript
const response = await fetch('/api/wallet/recharge', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ user_id: userId, amount: 500 })
});
const result = await response.json();
console.log('New Balance:', result.new_balance);
```

### 4. Place Order with Wallet
```javascript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: userId,
    seat_number: 'A1',
    total_amount: 150,
    payment_method: 'wallet'
  })
});
```

### 5. Cancel Order & Get Refund
```javascript
const response = await fetch(`/api/orders/${orderId}/cancel`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ reason: 'Changed my mind' })
});
const result = await response.json();
console.log('Refunded:', result.refunded_amount);
```

---

## Sample Data

After running the system, you'll see transactions like:

| Type | Amount | Description | Reference |
|------|--------|-------------|-----------|
| CREDIT | ₹100 | Wallet recharge | recharge |
| DEBIT | ₹150 | Order#1 - Food purchase | order |
| CREDIT | ₹150 | Refund for Order#1 | refund |
| DEBIT | ₹200 | Order#2 - Food purchase | order |
| CREDIT | ₹50 | Partial Refund | refund |

---

## Admin Features

### View All Transactions (Future)
```
GET /api/admin/transactions - View all transactions
POST /api/admin/wallet/credit/:userId - Manual credit
POST /api/admin/wallet/debit/:userId - Manual debit
```

---

## Security Best Practices

✅ **What We Do:**
- Every transaction is logged with timestamp
- User can only view their own transactions
- Wallet balance updated atomically
- Refunds verified with original order
- All amounts logged for audit trail

✅ **What to Add (Optional):**
- Rate limiting on recharge
- Maximum wallet limit
- Transaction approval for large amounts
- Email notifications for transactions
- Admin approval for manual credits

---

## Error Handling

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Amount must be > 0 | Invalid recharge amount |
| 400 | Insufficient wallet balance | Not enough money for order |
| 403 | Access denied | Trying to access another user's wallet |
| 404 | Order not found | Order ID doesn't exist |
| 404 | User not found | User ID doesn't exist |
| 500 | Database error | Server-side issue |

---

## Testing Checklist

- ✅ Recharge wallet
- ✅ View transaction history
- ✅ Place order with wallet payment
- ✅ Cancel order and refund
- ✅ View wallet summary
- ✅ Verify all transactions in history
- ✅ Check balance after each operation

---

**Your wallet system is now industry-level! 🚀**

Track every rupee with complete transparency and audit trail.
