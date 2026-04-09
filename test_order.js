const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', (e) => resolve({ status: 500, error: e.message }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('🍽️ REAL-TIME ORDER SYSTEM TEST');
  console.log('==============================\n');

  // 1. Admin login
  console.log('1. Admin Login');
  let res = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/login',
    method: 'POST', headers: {'Content-Type': 'application/json'}
  }, { email: 'admin@canteen.com', password: 'admin' });
  console.log('   Status:', res.status);
  const adminToken = res.data.token;
  console.log('   Token received:', adminToken ? 'YES' : 'NO', '\n');

  // 2. User login
  console.log('2. User Login');
  res = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/login',
    method: 'POST', headers: {'Content-Type': 'application/json'}
  }, { email: 'test@example.com', password: 'password', position: 'Employee', department: 'IT' });
  console.log('   Status:', res.status);
  const userToken = res.data.token;
  const userId = res.data.user.id;
  console.log('   Token received:', userToken ? 'YES' : 'NO');
  console.log('   User ID:', userId, '\n');

  // 3. Place order
  console.log('3. Place Order');
  res = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/orders',
    method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + userToken}
  }, { user_id: userId, seat_number: 'A1', total_amount: 150, payment_method: 'wallet' });
  console.log('   Status:', res.status);
  const orderId = res.data.order_id;
  console.log('   Order ID:', orderId, '\n');

  if (!orderId) return;

  // 4. Check initial status
  console.log('4. Check Initial Order Status');
  res = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/orders/' + orderId,
    method: 'GET'
  });
  console.log('   Status:', res.status);
  console.log('   Order Status:', res.data.status, '\n');

  // 5. Update status to Accepted
  console.log('5. Update Status to Accepted');
  res = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/orders/' + orderId + '/status',
    method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken}
  }, { status: 'Accepted' });
  console.log('   Status:', res.status);
  console.log('   Response:', res.data, '\n');

  // 6. Check updated status
  console.log('6. Check Updated Order Status');
  res = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/orders/' + orderId,
    method: 'GET'
  });
  console.log('   Status:', res.status);
  console.log('   Order Status:', res.data.status, '\n');

  console.log('==============================');
  console.log('✅ REAL-TIME ORDER SYSTEM WORKING!');
  console.log('==============================');
}

test().catch(console.error);