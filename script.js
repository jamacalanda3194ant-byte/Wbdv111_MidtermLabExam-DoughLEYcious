// ================= cart counter =================
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = cart.reduce((sum, item) => sum + item.qty, 0);
  const counters = document.querySelectorAll("#cart-count");
  counters.forEach(counter => {
    counter.textContent = total;
  });
}

// para pag every load ng page nag u-update
updateCartCount();

// ================= notification =================
function showToast(message) {
  let toast = document.getElementById("toast");

  // nag c-create ng toast notif pag di nag e-exist order
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ================= shop page and add to cart =================
const productCards = document.querySelectorAll(".product-card");

if (productCards.length > 0) {
  productCards.forEach(card => {
    const input = card.querySelector("input");
    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");
    const addBtn = card.querySelector(".add-to-cart-btn");

    // plus button
    if (plus) {
      plus.addEventListener("click", (e) => {
        e.stopPropagation();
        input.value = (parseInt(input.value) || 0) + 1;
      });
    }

    // minus button
    if (minus) {
      minus.addEventListener("click", (e) => {
        e.stopPropagation();
        if (parseInt(input.value) > 0) {
          input.value = parseInt(input.value) - 1;
        }
      });
    }

    // add to cart button
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        let qty = parseInt(input.value);

        if (qty <= 0) {
          showToast("⚠️ Please select a quantity first!");
          return;
        }

        const name = card.querySelector("h3").textContent.trim();
        const priceText = card.querySelector(".price").textContent;
        const price = parseFloat(priceText.replace("₱", "").trim());

        // img source
        const img = card.querySelector("img");
        const imgSrc = img ? img.src : "";

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let existing = cart.find(item => item.name === name);

        if (existing) {
          existing.qty += qty;
        } else {
          cart.push({ name, price, qty, imgSrc });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();

        // reset input
        input.value = 0;

        // show notif
        showToast(`✅ ${name} added to cart!`);
      });
    }
  });
}

// ================= order page =================
function selectOrder(type) {
  localStorage.setItem("orderType", type);

  const messages = {
    "6pcs": "Box of 6 selected! 🍪",
    "8pcs": "Box of 8 selected! 🍪🍪",
    "12pcs": "Box of 12 selected! 🍪🍪🍪"
  };

  showToast(messages[type] || "Order selected!");

  setTimeout(() => {
    window.location.href = "shop.html";
  }, 1000);
}

// ================= navigation =================
function goToShop() {
  window.location.href = "shop.html";
}

function goToOrderPage() {
  window.location.href = "order.html";
}

// ================= cart page =================
function displayCart() {
  const cartContainer = document.getElementById("cart-items");
  const subtotalDisplay = document.getElementById("subtotal-price");
  const totalDisplay = document.getElementById("total-price");
  const deliveryFee = 50;

  // gumagana lang sa cart page
  if (!cartContainer) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // for empty cart
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty!</h3>
        <p>Looks like you haven't added any cookies yet.</p>
        <button class="hero-btn" onclick="location.href='shop.html'">
          🍪 Start Shopping
        </button>
      </div>
    `;

    if (subtotalDisplay) subtotalDisplay.textContent = "₱0";
    if (totalDisplay) totalDisplay.textContent = "₱" + deliveryFee;
    updateCartCount();
    return;
  }

  // cart items (display)
  let subtotal = 0;
  cartContainer.innerHTML = "";

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;

    cartContainer.innerHTML += `
      <div class="cart-item">
        <img src="${item.imgSrc || 'images/choco chip.jpg'}" 
             alt="${item.name}"
             onerror="this.src='images/choco chip.jpg'">
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>₱${item.price} x ${item.qty}</p>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="decreaseQty(${index})">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="increaseQty(${index})">+</button>
          </div>
        </div>
        <div class="cart-item-price">₱${(item.price * item.qty).toFixed(2)}</div>
        <button class="remove-btn" onclick="removeItem(${index})" 
                title="Remove item">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });

  // total payment
  let total = subtotal + deliveryFee;

  if (subtotalDisplay) subtotalDisplay.textContent = "₱" + subtotal.toFixed(2);
  if (totalDisplay) totalDisplay.textContent = "₱" + total.toFixed(2);

  updateCartCount();
}

// ================= INCREASE QTY =================
function increaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].qty += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// ================= DECREASE QTY =================
function decreaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    // mawawala yung item pag nag reach ng o
    cart.splice(index, 1);
    showToast("🗑️ Item removed from cart!");
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// ================= remove item =================
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const removedName = cart[index].name;
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
  showToast(`🗑️ ${removedName} removed from cart!`);
}

// ================= for clear cart =================
function clearCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    showToast("⚠️ Your cart is already empty!");
    return;
  }

  if (confirm("Are you sure you want to clear your cart?")) {
    localStorage.removeItem("cart");
    showToast("🗑️ Cart cleared!");

    setTimeout(() => {
      location.reload();
    }, 1000);
  }
}

// ================= checkout button =================
function checkout() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    showToast("⚠️ Your cart is empty! Add some cookies first 🍪");
    return;
  }

  // fill order summary in modal
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let deliveryFee = 50;
  let total = subtotal + deliveryFee;

  const summaryContainer = document.getElementById("modal-summary");
  if (summaryContainer) {
    let summaryHTML = `<h4>📋 Order Summary</h4>`;

    cart.forEach(item => {
      summaryHTML += `
        <div class="modal-summary-item">
          <span>${item.name} x${item.qty}</span>
          <span>₱${(item.price * item.qty).toFixed(2)}</span>
        </div>
      `;
    });

    summaryHTML += `
      <div class="modal-summary-item">
        <span>Delivery Fee</span>
        <span>₱${deliveryFee.toFixed(2)}</span>
      </div>
      <div class="modal-summary-total">
        <span>Total</span>
        <span>₱${total.toFixed(2)}</span>
      </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
  }

  // set minimum date to today
  const dateInput = document.getElementById("checkout-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // show modal
  const modal = document.getElementById("checkout-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

// ================= close checkout modal =================
function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// ================= close modal when clicking overlay =================
document.addEventListener("click", function(e) {
  const modal = document.getElementById("checkout-modal");
  if (e.target === modal) {
    closeCheckoutModal();
  }
});

// ================= close modal with ESC key =================
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeCheckoutModal();
  }
});

// ================= show file name =================
function showFileName(input) {
  const fileNameDisplay = document.getElementById("file-name-display");
  if (input.files && input.files[0] && fileNameDisplay) {
    fileNameDisplay.textContent = "📄 " + input.files[0].name;
    fileNameDisplay.classList.add("show");
  }
}

// ================= submit order =================
function submitOrder(event) {
  event.preventDefault();

  const name = document.getElementById("checkout-name").value.trim();
  const phone = document.getElementById("checkout-phone").value.trim();
  const address = document.getElementById("checkout-address").value.trim();
  const date = document.getElementById("checkout-date").value;
  const time = document.getElementById("checkout-time").value;
  const proof = document.getElementById("checkout-proof").files[0];

  // validate all fields
  if (!name || !phone || !address || !date || !time || !proof) {
    showToast("⚠️ Please fill in all fields!");
    return;
  }

  // validate phone number
  if (phone.length < 11) {
    showToast("⚠️ Please enter a valid phone number!");
    return;
  }

  // get cart for summary
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let total = subtotal + 50;

  // close modal
  closeCheckoutModal();

  // clear cart
  localStorage.removeItem("cart");
  updateCartCount();
  displayCart();

  // show success toast
  showToast("✅ Order placed successfully! 🍪");

  // show thank you message after delay
  setTimeout(() => {
    alert(
      `🍪 Thank you for ordering from Dough LEYcious!\n\n` +
      `📋 Order Details:\n` +
      `👤 Name: ${name}\n` +
      `📱 Phone: ${phone}\n` +
      `📍 Address: ${address}\n` +
      `📅 Delivery: ${date} at ${time}\n` +
      `💰 Total: ₱${total.toFixed(2)}\n\n` +
      `We will contact you shortly. 💛`
    );
    window.location.href = "index.html";
  }, 1500);
}

// ================= total =================
function getTotal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ================= run page pag nireload =================
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  displayCart();
});
