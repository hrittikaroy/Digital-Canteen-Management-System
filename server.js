const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '140622',
  database: 'digital_canteen'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Create tables
db.query(`CREATE TABLE IF NOT EXISTS menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255),
  price DECIMAL(10,2),
  category VARCHAR(50),
  image_url VARCHAR(500)
)`, (err) => {
  if (err) console.error('Error creating menu table:', err);
  else {
    // Try to add stock column
    db.query(`ALTER TABLE menu ADD stock INT DEFAULT 10`, (alterErr) => {
      // Ignore error if column already exists
      if (alterErr && !alterErr.message.includes('Duplicate column name')) {
        console.error('Error adding stock column:', alterErr);
      } else {
        console.log('Stock column ready');
      }
    });
  }
});

db.query(`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  wallet_balance DECIMAL(10,2) DEFAULT 0
)`, (err) => {
  if (err) console.error('Error creating users table:', err);
});

db.query(`CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  seat VARCHAR(50),
  items TEXT,
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) console.error('Error creating orders table:', err);
});

// Insert sample data
db.query(`INSERT IGNORE INTO menu (item_name, price, category, image_url) VALUES
  ('Paneer Butter Masala', 120, 'indian', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&q=80'),
  ('Salad', 100, 'continental', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&q=80'),
  ('Chicken Curry', 130, 'indian', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&q=80'),
  ('Chow Mein', 80, 'snacks', 'https://images.pexels.com/photos/7138913/pexels-photo-7138913.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Grilled Chicken', 150, 'continental', 'https://images.pexels.com/photos/6107768/pexels-photo-6107768.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('White Sauce Pasta', 90, 'continental', 'https://images.pexels.com/photos/4374556/pexels-photo-4374556.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Samosa', 40, 'snacks', 'https://images.pexels.com/photos/21078315/pexels-photo-21078315.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Spring Roll', 50, 'snacks', 'https://images.pexels.com/photos/12356601/pexels-photo-12356601.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('French Fries', 60, 'snacks', 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Butter Chicken with Roti', 140, 'indian', 'https://images.pexels.com/photos/29186508/pexels-photo-29186508.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Sushi', 150, 'japanese', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&q=80'),
  ('Fish and Chips', 110, 'continental', 'https://images.pexels.com/photos/34019400/pexels-photo-34019400.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Burger', 90, 'continental', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80'),
  ('Cold Coffee', 70, 'snacks', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&q=80'),
  ('Ramen', 120, 'japanese', 'https://images.pexels.com/photos/33493350/pexels-photo-33493350.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Tempura', 100, 'japanese', 'https://images.pexels.com/photos/8953714/pexels-photo-8953714.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Grilled Fish', 160, 'continental', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80'),
  ('Pasta Carbonara', 110, 'continental', 'https://images.pexels.com/photos/20352388/pexels-photo-20352388.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Caesar Salad', 80, 'continental', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&q=80'),
  ('Dal Makhani', 100, 'indian', 'https://images.pexels.com/photos/28674557/pexels-photo-28674557.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Nachos', 90, 'snacks', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop&q=80'),
  ('Pakora', 50, 'snacks', 'https://images.pexels.com/photos/29547419/pexels-photo-29547419.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Onigiri', 70, 'japanese', 'https://images.pexels.com/photos/17593638/pexels-photo-17593638.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Steak', 200, 'continental', 'https://images.pexels.com/photos/33967668/pexels-photo-33967668.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Chole Bhature', 80, 'indian', 'https://images.pexels.com/photos/31306976/pexels-photo-31306976.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Popcorn', 40, 'snacks', 'https://images.pexels.com/photos/7234408/pexels-photo-7234408.jpeg?auto=compress&cs=tinysrgb&w=400')`, (err) => {
  if (err) console.error('Error inserting menu data:', err);
  else {
    // Update stock values for existing items
    db.query(`UPDATE menu SET stock = CASE 
      WHEN item_name = 'Paneer Butter Masala' THEN 50
      WHEN item_name = 'Veg Biryani' THEN 30
      WHEN item_name = 'Chicken Curry' THEN 35
      WHEN item_name = 'Chow Mein' THEN 75
      WHEN item_name = 'Grilled Chicken' THEN 45
      WHEN item_name = 'White Sauce Pasta' THEN 55
      WHEN item_name = 'Veg Pasta' THEN 55
      WHEN item_name = 'Samosa' THEN 100
      WHEN item_name = 'Spring Roll' THEN 80
      WHEN item_name = 'French Fries' THEN 120
      WHEN item_name = 'Butter Chicken' THEN 40
      WHEN item_name = 'Sushi' THEN 65
      WHEN item_name = 'Fish and Chips' THEN 35
      WHEN item_name = 'Burger' THEN 60
      WHEN item_name = 'Cold Coffee' THEN 80
      ELSE 10 END`, (updateErr) => {
      if (updateErr) console.error('Error updating stock values:', updateErr);
    });

    db.query(`UPDATE menu SET
      item_name = CASE
        WHEN item_name = 'Maggi Noodles' THEN 'French Fries'
        WHEN item_name = 'Fried Rice' THEN 'Sushi'
        ELSE item_name END,
      category = CASE
        WHEN item_name = 'Maggi Noodles' THEN 'snacks'
        WHEN item_name = 'Fried Rice' THEN 'japanese'
        WHEN item_name = 'Butter Chicken' THEN 'indian'
        ELSE category END,
      image_url = CASE
        WHEN item_name = 'Maggi Noodles' THEN 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Fried Rice' THEN 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&q=80'
        WHEN item_name = 'Butter Chicken' THEN 'https://images.pexels.com/photos/29186508/pexels-photo-29186508.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'White Sauce Pasta' THEN 'https://images.pexels.com/photos/4374556/pexels-photo-4374556.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Chow Mein' THEN 'https://images.pexels.com/photos/7138913/pexels-photo-7138913.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Grilled Chicken' THEN 'https://images.pexels.com/photos/6107768/pexels-photo-6107768.jpeg?auto=compress&cs=tinysrgb&w=400'
        ELSE image_url END
      WHERE item_name IN ('Maggi Noodles', 'Fried Rice', 'Butter Chicken', 'White Sauce Pasta', 'Chow Mein', 'Grilled Chicken')`, (updateImagesErr) => {
      if (updateImagesErr) console.error('Error updating legacy item names or images:', updateImagesErr);
    });

    db.query(`UPDATE menu SET item_name = 'White Sauce Pasta', image_url = 'https://images.pexels.com/photos/4374556/pexels-photo-4374556.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE item_name = 'Veg Pasta'`, (renameErr) => {
      if (renameErr) console.error('Error renaming Veg Pasta to White Sauce Pasta:', renameErr);
    });

    db.query(`UPDATE menu SET item_name = 'Butter Chicken with Roti', image_url = 'https://images.pexels.com/photos/29186508/pexels-photo-29186508.jpeg?auto=compress&cs=tinysrgb&w=400' WHERE item_name = 'Butter Chicken'`, (renameButterErr) => {
      if (renameButterErr) console.error('Error renaming Butter Chicken to Butter Chicken with Roti:', renameButterErr);
    });

    db.query(`UPDATE menu SET item_name = 'Salad', category = 'continental' WHERE item_name = 'Veg Biryani'`, (renameSaladErr) => {
      if (renameSaladErr) console.error('Error renaming Veg Biryani to Salad:', renameSaladErr);
    });

    db.query(`UPDATE menu SET
      image_url = CASE
        WHEN item_name = 'Ramen' THEN 'https://images.pexels.com/photos/33493350/pexels-photo-33493350.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Tempura' THEN 'https://images.pexels.com/photos/8953714/pexels-photo-8953714.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Pasta Carbonara' THEN 'https://images.pexels.com/photos/20352388/pexels-photo-20352388.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Dal Makhani' THEN 'https://images.pexels.com/photos/28674557/pexels-photo-28674557.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Pakora' THEN 'https://images.pexels.com/photos/29547419/pexels-photo-29547419.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Onigiri' THEN 'https://images.pexels.com/photos/17593638/pexels-photo-17593638.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Steak' THEN 'https://images.pexels.com/photos/33967668/pexels-photo-33967668.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Chole Bhature' THEN 'https://images.pexels.com/photos/31306976/pexels-photo-31306976.jpeg?auto=compress&cs=tinysrgb&w=400'
        WHEN item_name = 'Popcorn' THEN 'https://images.pexels.com/photos/7234408/pexels-photo-7234408.jpeg?auto=compress&cs=tinysrgb&w=400'
        ELSE image_url END
      WHERE item_name IN ('Ramen', 'Tempura', 'Pasta Carbonara', 'Dal Makhani', 'Pakora', 'Onigiri', 'Steak', 'Chole Bhature', 'Popcorn')`, (updateNewImagesErr) => {
      if (updateNewImagesErr) console.error('Error updating new menu item images:', updateNewImagesErr);
    });
  }
});

// Clean up duplicates - keep only the latest entry for each item_name
db.query(`
  DELETE t1 FROM menu t1
  INNER JOIN menu t2 
  WHERE t1.id < t2.id AND t1.item_name = t2.item_name
`, (err) => {
  if (err) console.error('Error cleaning up duplicates:', err);
  else console.log('Menu duplicates cleaned up');
});

db.query(`INSERT IGNORE INTO users (email, password, wallet_balance) VALUES
  ('user@example.com', 'password', 500)`, (err) => {
  if (err) console.error('Error inserting user data:', err);
});

// API Routes

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@canteen.com' && password === 'admin') {
    return res.json({ success: true, user: { id: 0, email, role: 'admin' } });
  }

  // For demo purposes, allow any email/password combination for regular users
  // First check if user exists in database
  db.query('SELECT id, email, wallet_balance FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      // For demo: create user on the fly if doesn't exist
      const userId = Math.floor(Math.random() * 10000) + 1;
      const wallet_balance = 500; // Default balance
      const name = email.split('@')[0]; // Use email prefix as name
      db.query('INSERT INTO users (id, name, email, password, wallet_balance) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)', [userId, name, email, password, wallet_balance], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, user: { id: userId, email, wallet_balance } });
      });
    }
  });
});

// Get menu
app.get('/api/menu', (req, res) => {
  db.query('SELECT * FROM menu', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get user wallet
app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT wallet_balance FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ balance: results[0] ? results[0].wallet_balance : 0 });
  });
});

// Pay from wallet
app.post('/api/wallet/pay', (req, res) => {
  const { user_id, amount } = req.body;
  db.query('SELECT wallet_balance FROM users WHERE id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results[0] || results[0].wallet_balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
    db.query('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [amount, user_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, new_balance: results[0].wallet_balance - amount });
    });
  });
});

// Place order
app.post('/api/orders', (req, res) => {
  const { user_id, seat, items, total } = req.body;
  db.query('INSERT INTO orders (user_id, seat, items, total) VALUES (?, ?, ?, ?)', [user_id, seat, JSON.stringify(items), total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ order_id: result.insertId });
  });
});

// Get order status
app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  db.query('SELECT status FROM orders WHERE id = ?', [orderId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: results[0] ? results[0].status : 'Not found' });
  });
});

// Update order status (for admin)
app.put('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Admin: Add menu item
app.post('/api/menu', (req, res) => {
  const { name, price, category, image } = req.body;
  db.query('INSERT INTO menu (item_name, price, category, image_url) VALUES (?, ?, ?, ?)', [name, price, category, image], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// Admin: Update menu item
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, category, image } = req.body;
  db.query('UPDATE menu SET item_name = ?, price = ?, category = ?, image_url = ? WHERE id = ?', [name, price, category, image, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Admin: Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM menu WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/recommend', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/recommend', {
            item: req.body.item
        });

        res.json(response.data);
    } catch (error) {
        console.error("Python Error:", error.message);
        res.status(500).json({ error: "Python service failed" });
    }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = parseInt(PORT, 10) + 1;
    console.warn(`Port ${PORT} in use, trying ${fallbackPort}...`);
    app.listen(fallbackPort, () => {
      console.log(`Server running on http://localhost:${fallbackPort}`);
    }).on('error', (err2) => {
      console.error('Failed to start server on fallback port', err2);
    });
  } else {
    console.error('Server error:', err);
  }
});