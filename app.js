const products = [
  {
    id: 1,
    name: "Zeest",
    price: 1499,
    description: "A bold, captivating fragrance that defines confidence.",
    image: "https://via.placeholder.com/400x500?text=Zeest"
  },
  {
    id: 2,
    name: "Elle Suave",
    price: 1399,
    description: "Soft, floral essence made for elegance and grace.",
    image: "https://via.placeholder.com/400x500?text=Elle+Suave"
  },
  {
    id: 3,
    name: "Dublin",
    price: 1599,
    description: "A fresh, powerful scent that lasts all day.",
    image: "https://via.placeholder.com/400x500?text=Dublin"
  },
  {
    id: 4,
    name: "Enchantment",
    price: 1499,
    description: "Charming and sweet, ideal for memorable moments.",
    image: "https://via.placeholder.com/400x500?text=Enchantment"
  }
];

const cart = [];

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cart-count");
const modal = document.getElementById("productModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");

let selectedProduct = null;

// Render products
products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p>Rs ${product.price}</p>
  `;
  card.onclick = () => openModal(product);
  productGrid.appendChild(card);
});

// Modal handlers
function openModal(product) {
  selectedProduct = product;
  modalImage.src = product.image;
  modalTitle.textContent = product.name;
  modalDesc.textContent = product.description;
  modalPrice.textContent = product.price;
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  selectedProduct = null;
}

function addToCartFromModal() {
  if (selectedProduct) {
    const found = cart.find(item => item.id === selectedProduct.id);
    if (found) {
      found.qty++;
    } else {
      cart.push({ ...selectedProduct, qty: 1 });
    }
    closeModal();
    updateCartUI();
    toggleCart(true);
  }
}

// Cart Sidebar
function toggleCart(forceOpen = null) {
  const cartSidebar = document.getElementById("cartSidebar");
  if (forceOpen === true) {
    cartSidebar.classList.add("active");
  } else if (forceOpen === false) {
    cartSidebar.classList.remove("active");
  } else {
    cartSidebar.classList.toggle("active");
  }
}

// Render Cart
function updateCartUI() {
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `${item.name} x${item.qty} – Rs ${item.price * item.qty}`;
    cartItems.appendChild(div);
    total += item.price * item.qty;
  });

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    const shipping = total >= 1999 ? 0 : 200;
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<strong>Subtotal: Rs ${total}<br>Shipping: Rs ${shipping}<br>Total: Rs ${total + shipping}</strong>`;
    cartItems.appendChild(document.createElement("hr"));
    cartItems.appendChild(totalDiv);
  }

  cartCount.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
}

function goToCheckout() {
  toggleCart(false);
  window.location.hash = "#checkout";
}

// Checkout form
document.getElementById("checkoutForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value;
  const phone = form.phone.value;
  const address = form.address.value;

  const order = {
    name,
    phone,
    address,
    items: cart,
    total: cart.reduce((sum, i) => sum + i.qty * i.price, 0),
  };

  const res = await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });

  if (res.ok) {
    const invoice = await res.json();
    document.getElementById("checkout").style.display = "none";
    const invoiceEl = document.getElementById("invoiceDetails");
    invoiceEl.innerHTML = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <hr/>
      ${cart.map(item => `<p>${item.name} x${item.qty} = Rs ${item.qty * item.price}</p>`).join("")}
      <hr/>
      <p><strong>Total: Rs ${order.total >= 1999 ? order.total : order.total + 200}</strong></p>
    `;
    document.getElementById("invoice").style.display = "block";
    cart.length = 0;
    updateCartUI();
  } else {
    alert("Order failed.");
  }
});
