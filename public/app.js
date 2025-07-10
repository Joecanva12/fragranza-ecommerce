// === app.js ===

const products = [
  { id: 1, name: "Zeest", price: 1499, desc: "Bold and captivating scent.", image: "images/zeest.jpg" },
  { id: 2, name: "Elle Suave", price: 1399, desc: "Elegant feminine fragrance.", image: "images/elle.jpg" },
  { id: 3, name: "Enchantment", price: 1599, desc: "Mystical and floral.", image: "images/enchantment.jpg" },
  { id: 4, name: "Dublin", price: 1499, desc: "Fresh and green masculine scent.", image: "images/dublin.jpg" },
  { id: 5, name: "Celestial", price: 1699, desc: "Heavenly blend for men.", image: "images/celestial.jpg" },
  { id: 6, name: "Immense", price: 1799, desc: "Powerful masculine impression.", image: "images/immense.jpg" },
  { id: 7, name: "Afternoon Swim", price: 1599, desc: "Refreshing aquatic vibe.", image: "images/swim.jpg" },
  { id: 8, name: "Bombshell", price: 1399, desc: "Alluring and confident.", image: "images/bombshell.jpg" }
];

let cart = [];
let currentProduct = null;

const grid = document.getElementById("productGrid");
products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <h4>${product.name}</h4>
    <p>Rs ${product.price}</p>
  `;
  card.onclick = () => openModal(product);
  grid.appendChild(card);
});

function openModal(product) {
  currentProduct = product;
  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalTitle").innerText = product.name;
  document.getElementById("modalDesc").innerText = product.desc;
  document.getElementById("modalPrice").innerText = product.price;
  document.getElementById("productModal").style.display = "block";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

function addToCartFromModal() {
  const item = cart.find(p => p.id === currentProduct.id);
  if (item) item.qty++;
  else cart.push({ ...currentProduct, qty: 1 });
  updateCart();
  closeModal();
}

function updateCart() {
  const container = document.getElementById("cartItems");
  const count = document.getElementById("cart-count");
  container.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `${item.name} x${item.qty} - Rs ${item.qty * item.price}`;
    container.appendChild(div);
    total += item.qty * item.price;
  });
  count.innerText = cart.length;
  const totalDiv = document.createElement("div");
  totalDiv.innerHTML = `<strong>Total: Rs ${total}</strong>`;
  container.appendChild(totalDiv);
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  cartSidebar.style.display = cartSidebar.style.display === "block" ? "none" : "block";
}

function goToCheckout() {
  toggleCart();
  document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
}

// === Checkout Form Submission ===
document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value;
  const phone = form.phone.value;
  const email = form.email.value;
  const address = form.address.value;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = {
    name,
    phone,
    email,
    address,
    items: cart,
    total
  };

  const res = await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });

  const data = await res.json();

  if (data.success) {
    showInvoice({ ...order, orderId: data.orderId });
    cart = [];
    updateCart();
  } else {
    alert("Order failed. Please try again.");
  }
});

// === Invoice Show/Hide ===
function showInvoice(order) {
  const invoice = document.getElementById("invoice");
  const form = document.getElementById("checkoutForm");

  document.getElementById("invoiceDetails").innerHTML = `
    <p>Thank you, <strong>${order.name}</strong>! Your order has been placed.</p>
    <p>Invoice ID: ${order.orderId}</p>
    <p>We’ve sent a confirmation email to: <strong>${order.email}</strong></p>
  `;

  invoice.style.display = "block";
  form.reset();
  form.style.display = "none";

  setTimeout(() => {
    invoice.style.opacity = 1;
    invoice.style.transition = "opacity 1s ease";
  }, 100);

  setTimeout(() => {
    invoice.style.opacity = 0;
    setTimeout(() => {
      invoice.style.display = "none";
      form.style.display = "block";
    }, 1000);
  }, 10000);
}
