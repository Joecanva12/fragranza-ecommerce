const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// === 1. MIDDLEWARE ===
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// === 2. GMAIL SETUP ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "joecanva008@gmail.com",         // <-- Your Gmail address
    pass: "mrln zmyu qbfv vert"  // <-- 16-digit app password
  }
});

// === 3. ORDER ROUTE ===
app.post("/order", async (req, res) => {
  const order = req.body;

  const itemsText = order.items
    .map(item => `${item.name} x${item.qty}`)
    .join(", ");

  const shipping = order.total >= 1999 ? 0 : 200;
  const totalWithShipping = order.total + shipping;

  const message = `
🛍 New Order from Fragranza.pk

👤 Name: ${order.name}
📞 Phone: ${order.phone}
🏠 Address: ${order.address}
🧴 Items: ${itemsText}
💰 Total: Rs ${totalWithShipping}
`;

  try {
    await transporter.sendMail({
      from: '"Fragranza.pk" <inforender@fragranza.pk>', // sender
      to: "syednaqash92@gmail.com", // recipient(s)
      subject: "🛍 New Fragranza Order - Render",
      text: message
    });

    res.json({ success: true, orderId: Date.now() });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === 4. START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
