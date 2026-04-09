# 💰 Smart Wallet System - Quick Reference

## ✨ Features Implemented

### 1. **Transaction Tracking** 📊
- Every wallet operation is recorded
- Complete audit trail with timestamps
- Track credits (recharge, refunds) and debits (orders, payments)

### 2. **Wallet Recharge** ➕
- Users can add money to wallet
- Instant credit transaction
- Track all recharges

### 3. **Refund System** 🔄
- Cancel orders and get instant refunds
- Automatic credit back to wallet
- Full reason logging

### 4. **Analytics** 📈
- View wallet summary with total credits/debits
- Transaction history (50 most recent)
- Reference tracking (links to orders)

---

## 🚀 New Endpoints (7 Total)

### Wallet Operations
1. **GET** `/api/wallet/:userId` - Get balance
2. **POST** `/api/wallet/recharge` - Add money
3. **POST** `/api/wallet/pay` - Spend money
4. **GET** `/api/wallet/history/:userId` - Transaction history
5. **GET** `/api/wallet/summary/:userId` - Wallet analytics

### Order with Refund
6. **POST** `/api/orders/:orderId/cancel` - Refund order
7. **POST** `/api/orders` - Place order with wallet payment

---

## 📋 Database Structure

```
transactions table
├── id (Primary Key)
├── user_id (Foreign Key → users)
├── amount (decimal)
├── type (ENUM: credit/debit)
├── status (ENUM: completed/pending/failed/refunded)
├── description (text)
├── reference_type (order/refund/recharge/payment)
├── reference_id (links to order)
├── created_at (timestamp)
└── updated_at (timestamp)

Indexes for performance:
- user_id (fast user lookups)
- created_at (fast date queries)
```

---

## 💻 Real Example Flow

```bash
# 1. User Recharges
POST /api/wallet/recharge
{
  "user_id": 3,
  "amount": 500
}
→ Creates CREDIT transaction
→ Balance: ₹500 → ₹1000

# 2. View Transaction
GET /api/wallet/history/3
→ Shows: "CREDIT ₹500 - Wallet recharge"

# 3. Place Order
POST /api/orders
{
  "user_id": 3,
  "seat_number": "A1",
  "total_amount": 200,
  "payment_method": "wallet"
}
→ Creates DEBIT transaction
→ Balance: ₹1000 → ₹800

# 4. Cancel Order
POST /api/orders/1/cancel
{
  "reason": "Not hungry anymore"
}
→ Creates CREDIT transaction (refund)
→ Balance: ₹800 → ₹1000

# 5. View Summary
GET /api/wallet/summary/3
→ Shows: Balance: ₹1000, Credited: ₹1000, Debited: ₹200
```

---

## 🔒 Security Features

✅ Token authentication required  
✅ Users can only access their own wallet  
✅ Admin role can manage all wallets  
✅ All transactions logged with timestamps  
✅ Atomic operations (no partial updates)  
✅ Refund verification with order  

---

## 📊 Transaction Types

### CREDIT (Money In) 💵
| Reference | Source | Example |
|-----------|--------|---------|
| `recharge` | User added | "Wallet recharge" |
| `refund` | Order cancelled | "Refund for Order#5" |
| `admin-credit` | Manual (future) | "Manual credit by admin" |

### DEBIT (Money Out) 💸
| Reference | Purpose | Example |
|-----------|---------|---------|
| `order` | Food order | "Order#5 - Food purchase" |
| `payment` | General payment | "Vending machine" |
| `admin-debit` | Manual (future) | "Fine/deduction" |

---

## 🧪 Testing Commands

### Test 1: Recharge Wallet
```bash
curl -X POST http://localhost:5001/api/wallet/recharge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":3,"amount":500}'
```

### Test 2: View History
```bash
curl -X GET http://localhost:5001/api/wallet/history/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Wallet Summary
```bash
curl -X GET http://localhost:5001/api/wallet/summary/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Place Order
```bash
curl -X POST http://localhost:5001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":3,
    "seat_number":"B5",
    "total_amount":150,
    "payment_method":"wallet"
  }'
```

### Test 5: Cancel Order
```bash
curl -X POST http://localhost:5001/api/orders/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Changed my mind"}'
```

---

## 📱 Frontend Display Ideas

### Wallet Card
```
┌─────────────────────────┐
│   💰 YOUR WALLET        │
│                         │
│   Balance: ₹900         │
│   Total Added: ₹1000    │
│   Total Spent: ₹100     │
│                         │
│  [+ RECHARGE]  [HISTORY]│
└─────────────────────────┘
```

### Transaction List
```
CREDIT  ₹500  Wallet recharge        Apr 2, 6:01 PM
DEBIT   ₹150  Order#1 - Food         Apr 2, 6:04 PM
CREDIT  ₹150  Refund Order#1         Apr 2, 6:05 PM
DEBIT   ₹200  Order#2 - Food         Apr 2, 6:10 PM
CREDIT  ₹100  Wallet recharge        Apr 2, 6:15 PM
```

---

## 🎯 Next Steps

1. **Update Frontend** - Show wallet balance, history, and recharge button
2. **Add Notifications** - Toast on successful transactions
3. **Refund UI** - Easy cancel order button with refund confirmation
4. **Analytics** - Show spending trends and balance over time
5. **Admin Panel** - Manual credit/debit for admins (optional)

---

## 📈 Performance

- **Indexes** on user_id and created_at for fast queries
- **LIMIT 50** on history to prevent large data transfers
- **Atomic updates** prevent race conditions
- **Foreign keys** maintain data integrity

---

## 🔄 Backward Compatibility

Existing orders still work:
- Old order endpoints unchanged
- Payment method defaults to `wallet`
- Can still pay cash at counter with `payment_method: "cash"`

---

## 📝 Database Migration Summary

Added one new table: `transactions`
- No changes to existing tables
- Fully backward compatible
- Orders table columns: seat_number, total_amount (not seat, total)

---

**Total Lines of Code Added:** ~400 lines  
**New Database Indexes:** 2  
**New Endpoints:** 7  
**Transaction Types:** 6+  
**Audit Trail:** Complete with timestamps

---

**Ready for production! 🚀**
