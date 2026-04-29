// ================= cart counter =================
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = cart.reduce((sum, item) => sum + item.qty, 0);
  const counters = document.querySelectorAll("#cart-count");
  counters.forEach(counter => {
    counter.textContent = total;
  });
}

// -------------------- para pag every load ng page nag u-update --------------------
updateCartCount();

// ================= notification =================
function showToast(message) {
  let toast = document.getElementById("toast");

  // -------------------- nag c-create ng toast notif pag di nag e-exist order --------------------
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

// ================= confirmation toast =================
function showConfirmToast(message, onConfirm) {
  // remove existing confirm toast if any
  const existing = document.getElementById("confirm-toast");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "confirm-toast";
  overlay.className = "confirm-toast-overlay";

  overlay.innerHTML = `
    <div class="confirm-toast-box">
      <p class="confirm-toast-message">🗑️ ${message}</p>
      <div class="confirm-toast-buttons">
        <button class="confirm-btn confirm-yes" id="confirm-yes">Yes, clear it</button>
        <button class="confirm-btn confirm-no" id="confirm-no">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // -------------------- force reflow then add active class for animation --------------------
  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  // -------------------- yes button --------------------
  document.getElementById("confirm-yes").addEventListener("click", () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
    onConfirm();
  });

  // -------------------- no / cancel button --------------------
  document.getElementById("confirm-no").addEventListener("click", () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
  });

  // -------------------- close when clicking overlay background --------------------
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

// ================= quick add to cart (for recommendation cards) =================
function quickAddToCart(name, price, imgSrc) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, imgSrc });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  displayCart();
  showToast(`✅ ${name} added to cart!`);

  // -------------------- smooth scroll to cart section so user sees the update --------------------
  const cartSection = document.querySelector(".cart-section");
  if (cartSection) {
    cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ================= shop page and add to cart =================
const productCards = document.querySelectorAll(".product-card");

if (productCards.length > 0) {
  productCards.forEach(card => {
    const input = card.querySelector("input");
    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");
    const addBtn = card.querySelector(".add-to-cart-btn");

    // -------------------- plus button --------------------
    if (plus) {
      plus.addEventListener("click", (e) => {
        e.stopPropagation();
        input.value = (parseInt(input.value) || 0) + 1;
      });
    }

    // -------------------- minus button --------------------
    if (minus) {
      minus.addEventListener("click", (e) => {
        e.stopPropagation();
        if (parseInt(input.value) > 0) {
          input.value = parseInt(input.value) - 1;
        }
      });
    }

    // -------------------- add to cart button --------------------
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

        // -------------------- img source --------------------
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

        // -------------------- reset input --------------------
        input.value = 0;

        // -------------------- show notif --------------------
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

  // -------------------- gumagana lang sa cart page --------------------
  if (!cartContainer) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // -------------------- for empty cart --------------------
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

  // -------------------- cart items (display) --------------------
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

  // -------------------- total payment --------------------
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
    // -------------------- mawawala yung item pag nag reach ng 0 --------------------
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

  // -------------------- show confirmation toast notification instead na browser(alert) confirm --------------------
  showConfirmToast("Are you sure you want to clear your cart?", () => {
    localStorage.removeItem("cart");
    showToast("🗑️ Cart cleared!");

    setTimeout(() => {
      location.reload();
    }, 1000);
  });
}

// ================= checkout button (cart page) =================
function checkout() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    showToast("⚠️ Your cart is empty! Add some cookies first 🍪");
    return;
  }

  // -------------------- redirect to form page - cart data stays in localStorage --------------------
  window.location.href = "form.html";
}

// ================= CHECKOUT PAGE FUNCTIONS (form.html) =================

// -------------------- load cart items into checkout page --------------------
function displayCheckoutItems() {
  const checkoutContainer = document.getElementById("checkout-items");
  const orderTotals = document.getElementById("order-totals");
  const proceedBtn = document.getElementById("proceed-btn");
  const emptyMsg = document.getElementById("empty-cart-msg");

  // ------------ only run on checkout/form page ------------
  if (!checkoutContainer) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ------------ empty cart ------------
  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (orderTotals) orderTotals.style.display = "none";
    if (proceedBtn) proceedBtn.disabled = true;
    return;
  }

  // ------------ hide empty message, show totals, enable button ------------
  if (emptyMsg) emptyMsg.style.display = "none";
  if (orderTotals) orderTotals.style.display = "block";
  if (proceedBtn) proceedBtn.disabled = false;

  // ------------ build items HTML and calculate subtotal ------------
  let subtotal = 0;
  let itemsHTML = "";

  cart.forEach((item) => {
    let itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    itemsHTML += `
      <div class="checkout-item">
        <img src="${item.imgSrc || 'images/choco chip.jpg'}" 
             alt="${item.name}"
             class="checkout-item-img"
             onerror="this.src='images/choco chip.jpg'">
        <div class="checkout-item-info">
          <h4>${item.name}</h4>
          <p>₱${item.price.toFixed(2)} × ${item.qty}</p>
        </div>
        <div class="checkout-item-total">
          <span>₱${itemTotal.toFixed(2)}</span>
        </div>
      </div>
    `;
  });

  checkoutContainer.innerHTML = itemsHTML;

  // --------------------- update totals ---------------------
  let deliveryFee = 50;
  let total = subtotal + deliveryFee;

  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery-fee");
  const totalEl = document.getElementById("order-total");

  if (subtotalEl) subtotalEl.textContent = "₱" + subtotal.toFixed(2);
  if (deliveryEl) deliveryEl.textContent = "₱" + deliveryFee.toFixed(2);
  if (totalEl) totalEl.textContent = "₱" + total.toFixed(2);
}

// ================= OPEN CHECKOUT MODAL (form.html) =================
function openCheckoutModal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    showToast("⚠️ Your cart is empty! Add some cookies first 🍪");
    return;
  }

  // --------------------- fill modal order summary ---------------------
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let deliveryFee = 50;
  let total = subtotal + deliveryFee;

  const summaryContainer = document.getElementById("modal-summary");
  if (summaryContainer) {
    let summaryHTML = `<h4>📋 Order Summary</h4>`;

    cart.forEach(item => {
      summaryHTML += `
        <div class="modal-summary-item">
          <span>${item.name} × ${item.qty}</span>
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
        <span><strong>Total</strong></span>
        <span><strong>₱${total.toFixed(2)}</strong></span>
      </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
  }

  // --------------------- set minimum date to today ---------------------
  const dateInput = document.getElementById("checkout-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // --------------------- show modal ---------------------
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

// ================= close success modal =================
function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// ================= show file name =================
function showFileName(input) {
  const fileNameDisplay = document.getElementById("file-name-display");
  if (input.files && input.files[0] && fileNameDisplay) {
    fileNameDisplay.textContent = "📄 " + input.files[0].name;
    fileNameDisplay.classList.add("show");
  }
}

// ================= INPUT VALIDATION =================

// -------------------- validate name - letters, spaces, and common name characters only --------------------
function validateName(name) {
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-'.]+$/;
  return nameRegex.test(name);
}

// ------------- validate phone - exactly 11 digits, no letters ------------------
function validatePhone(phone) {
  const phoneClean = phone.replace(/[\s\-]/g, "");
  const phoneRegex = /^\d{11}$/;
  return phoneRegex.test(phoneClean);
}

// -------------- check if string contains numbers --------------------
function containsNumbers(str) {
  return /\d/.test(str);
}

// -------------- check if string contains letters --------------------
function containsLetters(str) {
  return /[A-Za-z]/.test(str);
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
  const notes = document.getElementById("checkout-notes")
    ? document.getElementById("checkout-notes").value.trim()
    : "";

  // -------------------- validate all required fields ------------------
  if (!name || !phone || !address || !date || !time || !proof) {
    showToast("⚠️ Please fill in all required fields!");
    return;
  }

  // -------------------- validate name - no numbers allowed ----------------------------------
  if (containsNumbers(name)) {
    showToast("⚠️ Name should contain letters only, no numbers!");
    document.getElementById("checkout-name").focus();
    return;
  }

  if (!validateName(name)) {
    showToast("⚠️ Please enter a valid name (letters only)!");
    document.getElementById("checkout-name").focus();
    return;
  }

  // ------------- validate phone - no letters, exactly 11 digits ------------------
  if (containsLetters(phone)) {
    showToast("⚠️ Phone number should contain numbers only!");
    document.getElementById("checkout-phone").focus();
    return;
  }

  const phoneClean = phone.replace(/\D/g, "");

  if (phoneClean.length !== 11) {
    showToast(`⚠️ Phone number must be exactly 11 digits! (currently ${phoneClean.length})`);
    document.getElementById("checkout-phone").focus();
    return;
  }

  if (!validatePhone(phone)) {
    showToast("⚠️ Please enter a valid 11-digit phone number!");
    document.getElementById("checkout-phone").focus();
    return;
  }

  // get cart for summary
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let deliveryFee = 50;
  let total = subtotal + deliveryFee;

  // close checkout modal
  closeCheckoutModal();

  // build success details
  const successDetails = document.getElementById("success-details");
  if (successDetails) {
    let detailsHTML = `
      <div class="success-info">
        <p><strong>👤 Name:</strong> ${name}</p>
        <p><strong>📱 Phone:</strong> ${phone}</p>
        <p><strong>📍 Address:</strong> ${address}</p>
        <p><strong>📅 Delivery:</strong> ${date} at ${time}</p>
        <p><strong>💰 Total:</strong> ₱${total.toFixed(2)}</p>
        ${notes ? `<p><strong>📝 Notes:</strong> ${notes}</p>` : ""}
      </div>
      <div class="success-items">
        <h4>Items Ordered:</h4>
    `;

    cart.forEach(item => {
      detailsHTML += `
        <p>${item.name} × ${item.qty} — ₱${(item.price * item.qty).toFixed(2)}</p>
      `;
    });

    detailsHTML += `</div>`;
    successDetails.innerHTML = detailsHTML;
  }

  // show success modal
  const successModal = document.getElementById("success-modal");
  if (successModal) {
    successModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // clear cart
  localStorage.removeItem("cart");
  updateCartCount();

  showToast("✅ Order placed successfully! 🍪");
}

// ================= total =================
function getTotal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ================= MODAL EVENT LISTENERS =================

// close modals when clicking overlay
document.addEventListener("click", function (e) {
  const checkoutModal = document.getElementById("checkout-modal");
  const successModal = document.getElementById("success-modal");

  if (e.target === checkoutModal) {
    closeCheckoutModal();
  }
  if (e.target === successModal) {
    closeSuccessModal();
  }
});

// close modals with ESC key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeCheckoutModal();
    closeSuccessModal();
  }
});

// ================= para to every reload mo ng page nagr-run everything =================
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  displayCart();
  displayCheckoutItems();

  // ---- Full Name: block numbers in real-time section ----
  const nameInput = document.getElementById("checkout-name");
  if (nameInput) {
    // pinipigilan niya yung number keys from being typed and show real-time feedback
    nameInput.addEventListener("keypress", function (e) {
      if (/\d/.test(e.key)) {
        e.preventDefault();
        showToast("⚠️ Name should contain letters only, no numbers!");
      }
    });

    // catch paste with numbers
    nameInput.addEventListener("input", function () {
      if (containsNumbers(this.value)) {
        showToast("⚠️ Name should contain letters only, no numbers!");
        this.value = this.value.replace(/\d/g, "");
      }
    });
  }

  // ---- Phone Number: block letters in real-time section ----
  const phoneInput = document.getElementById("checkout-phone");
  if (phoneInput) {
    // pinipigilan niya yung letter keys na ma-type just in case may user na mag t-type ng letters, may real-time feedback
    phoneInput.addEventListener("keypress", function (e) {
      if (/[A-Za-z]/.test(e.key)) {
        e.preventDefault();
        showToast("⚠️ Phone number should contain numbers only!");
      }
    });

    // catch paste with letters and enforce max 11 digits
    phoneInput.addEventListener("input", function () {
      if (containsLetters(this.value)) {
        showToast("⚠️ Phone number should contain numbers only!");
        this.value = this.value.replace(/[A-Za-z]/g, "");
      }

      // tinatanggal niya pag or more like di niya binabasa pag may non-digit characters
      let digitsOnly = this.value.replace(/\D/g, "");

      // limit to 11 digits max (para hindi lumagpas sa 11 digits kahit walang letters)
      if (digitsOnly.length > 11) {
        digitsOnly = digitsOnly.substring(0, 11);
        this.value = digitsOnly;
        showToast("⚠️ Phone number must be exactly 11 digits!");
      }
    });

    // lumalabas warning pag umaalis sa field if not exactly 11 digits
    phoneInput.addEventListener("blur", function () {
      const digitsOnly = this.value.replace(/\D/g, "");
      if (digitsOnly.length > 0 && digitsOnly.length !== 11) {
        showToast(`⚠️ Phone number must be exactly 11 digits! (currently ${digitsOnly.length})`);
      }
    });
  }
});