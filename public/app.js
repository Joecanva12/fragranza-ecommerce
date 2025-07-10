const products = [
  { id: 1, name: 'Zeest', price: 1450, img: 'https://images.unsplash.com/photo-1611080626919-7d53c104e043?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Dublin', price: 1450, img: 'https://images.unsplash.com/photo-1617093727383-b76d791ed530?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Elle Suave', price: 1450, img: 'https://images.unsplash.com/photo-1630548887077-c6c7ce72ae45?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Gul-e-Zarif', price: 1450, img: 'https://images.unsplash.com/photo-1622201073233-0c2f5193c3e1?auto=format&fit=crop&w=600&q=80' }
];

let cart = [];
const productGrid = document.getElementById('productGrid');
products.forEach(product => {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${product.img}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p><strong>Rs ${product.price}</strong></p>
    <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
  `;
  productGrid.appendChild(card);
});

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(p => p.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cart-count');
  cartItems.innerHTML = '';
  let total = 0;
  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cartItems.innerHTML = '<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>';
    cart.forEach(item => {
      const itemTotal = item.qty * item.price;
      total += itemTotal;
      cartItems.innerHTML += `<tr><td>${item.name}</td><td>${item.qty}</td><td>Rs ${item.price}</td><td>Rs ${itemTotal}</td></tr>`;
    });
    const shipping = total >= 2000 ? 0 : 200;
    cartItems.innerHTML += `</tbody></table><p><strong>Shipping: Rs ${shipping}</strong></p><p><strong>Total: Rs ${total + shipping}</strong></p>`;
  }
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

document.getElementById('checkoutForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = this.name.value;
  const address = this.address.value;
  const phone = this.phone.value;

  if (!cart.length) return alert("Cart is empty!");

  const order = { name, address, phone, items: cart, time: new Date().toISOString() };

  fetch('/submit-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  }).then(res => res.json()).then(response => {
    if (response.success) {
      showInvoice(order);
    } else {
      alert('Order failed to submit.');
    }
  });
});

function showInvoice(order) {
  let invoice = `<p><strong>Name:</strong> ${order.name}</p><p><strong>Address:</strong> ${order.address}</p><p><strong>Phone:</strong> ${order.phone}</p>`;
  let total = 0;
  invoice += '<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>';
  order.items.forEach(item => {
    const itemTotal = item.qty * item.price;
    total += itemTotal;
    invoice += `<tr><td>${item.name}</td><td>${item.qty}</td><td>Rs ${item.price}</td><td>Rs ${itemTotal}</td></tr>`;
  });
  const shipping = total >= 2000 ? 0 : 200;
  invoice += `</tbody></table><p><strong>Shipping: Rs ${shipping}</strong></p><p><strong>Grand Total: Rs ${total + shipping}</strong></p>`;
  document.getElementById('invoiceDetails').innerHTML = invoice;
  document.getElementById('invoice').style.display = 'block';
  window.scrollTo({ top: document.getElementById('invoice').offsetTop, behavior: 'smooth' });
  cart = [];
  updateCart();
}

updateCart();
