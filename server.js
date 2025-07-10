const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Enable JSON body parsing
app.use(express.json());

// POST /order — handles order submission from frontend
app.post("/order", (req, res) => {
  const order = req.body;

  console.log("🧾 New Order:", order);

  // Optional: send Telegram/email/save to file here

  res.json({ success: true, orderId: Date.now() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
