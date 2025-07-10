// === server.js ===
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// === Gmail Setup ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "joecanva008@gmail.com",         // <-- Your Gmail address
    pass: "mrln zmyu qbfv vert"  // <-- 16-digit app password
  }
});

// === Order Route ===
app.post("/order", async (req, res) => {
  const order = req.body;

  const shipping = order.total >= 1999 ? 0 : 200;
  const totalWithShipping = order.total + shipping;

  const itemsHtml = order.items.map(
    item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>Rs ${item.qty * item.price}</td>
    </tr>`
  ).join("");

  const adminMessage = `
New Order Received:

Name: ${order.name}
Email: ${order.email}
Phone: ${order.phone}
Address: ${order.address}

Items:
${order.items.map(i => `${i.name} x${i.qty} - Rs ${i.qty * i.price}`).join("\n")}

Total (with shipping): Rs ${totalWithShipping}`;

  const customerMessage = `Thank you for your order at Fragranza.pk!

Name: ${order.name}
Phone: ${order.phone}

Your order has been received and will be processed shortly.

Items:
${order.items.map(i => `${i.name} x${i.qty} - Rs ${i.qty * i.price}`).join("\n")}

Shipping: Rs ${shipping}
Total: Rs ${totalWithShipping}

We’ll contact you soon. Thank you for shopping with us!`;

  try {
    // Send email to admin
    await transporter.sendMail({
      from: 'Fragranza.pk <inforender@fragranza.pk>',
      to: "syednaqash92@gmail.com",
      subject: "🛍 New Fragranza Order",
      text: adminMessage
    });

    // Send confirmation email to customer
    await transporter.sendMail({
      from: 'Fragranza.pk <your@gmail.com>',
      to: order.email,
      subject: "✅ Order Received - Fragranza.pk",
      text: customerMessage
    });

    res.json({ success: true, orderId: Date.now() });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
