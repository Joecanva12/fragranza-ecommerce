const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const basicAuth = require('basic-auth');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;
const ORDER_FILE = path.join(__dirname, 'orders.json');

app.use(bodyParser.json());
app.use(express.static('public'));

const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.name !== 'admin' || user.pass !== 'secret123') {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

if (!fs.existsSync(ORDER_FILE)) {
  fs.writeFileSync(ORDER_FILE, JSON.stringify([]));
}

app.post('/submit-order', (req, res) => {
  const order = req.body;
  order.time = new Date().toISOString();

  const orders = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf-8'));
  orders.push(order);
  fs.writeFileSync(ORDER_FILE, JSON.stringify(orders, null, 2));

  sendEmailNotification(order);
  res.json({ success: true });
});

app.get('/admin', auth, (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf-8'));
  const html = `
    <h1>Fragranza.pk Orders</h1>
    <ul>
      ${orders.map(o => `
        <li>
          <strong>${o.name}</strong> - ${o.phone} - ${o.time}<br/>
          Address: ${o.address}<br/>
          Items:<ul>${o.items.map(i => `<li>${i.name} x ${i.qty} - Rs ${i.price}</li>`).join('')}</ul>
        </li>
      `).join('')}
    </ul>
  `;
  res.send(html);
});

function sendEmailNotification(order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });

  const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'your-email@gmail.com',
  subject: 'New Order Received – Fragranza.pk',
  text: 'New order from ' + order.name +
        '\\nPhone: ' + order.phone +
        '\\nAddress: ' + order.address +
        '\\nItems: ' + order.items.map(i => `${i.name} x${i.qty}`).join(', ')
};


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email Error:', error);
    } else {
      console.log('Notification email sent:', info.response);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
