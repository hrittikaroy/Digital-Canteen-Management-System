const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '140622',
  database: 'digital_canteen'
});

db.connect((err) => {
  if (err) throw err;
  const sql = `ALTER TABLE orders MODIFY COLUMN status ENUM('Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered') DEFAULT 'Pending'`;
  db.query(sql, (err, results) => {
    if (err) throw err;
    console.log('Status column altered successfully');
    db.end();
  });
});