// ================= cart counter =================
function updateCartCount() {

  // Read cart items from localStorage.
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Compute total quantity by summing each item's qty.
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);


  const counters = document.querySelectorAll("#cart-count");
  counters.forEach((counter) => {
    counter.textContent = totalQty;
  });
}


// ================= carousel (header)=================
let slides = document.querySelectorAll(".slide");
let current = 0;

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

function nextSlide() {
  current = (current + 1) % slides.length;
  showSlide(current);
}

// auto change header every 3 seconds
setInterval(nextSlide, 3000);

// ================= Open ingredient modal (for menu) =================
let selectedModalCard = null;

function openIngredientModal(card) {
  const modal = document.getElementById("ingredientModal");
  if (!modal) return;

  selectedModalCard = card;

  const name = card.getAttribute("data-name");
  const tagline = card.getAttribute("data-tagline");
  const price = card.getAttribute("data-price");
  const img = card.getAttribute("data-img");
  const description = card.getAttribute("data-description");
  const ingredients = [];


  document.getElementById("modalImg").src = img;
  document.getElementById("modalImg").alt = name;
  document.getElementById("modalName").textContent = name;
  document.getElementById("modalTagline").textContent = tagline;
  document.getElementById("modalPrice").textContent = price;
  document.getElementById("modalDescription").textContent = description;

  const qtyInput = modal.querySelector(".quantity input[type='number']");
  if (qtyInput) qtyInput.value = 0;

  const list = document.getElementById("modalIngredients");
  list.innerHTML = "";
  ingredients.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.trim();
    list.appendChild(li);
  });

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}


// ================= Close ingredient modal (for menu) =================
function closeIngredientModal() {
  const modal = document.getElementById("ingredientModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// ================= Modal quantity and add to cart (menu.html) =================
function addModalToCart() {
  const modal = document.getElementById("ingredientModal");
  if (!modal) return;
  if (!selectedModalCard) {
    showToast("⚠️ Please select an item first!");
    return;
  }

  const qtyInput = modal.querySelector(".quantity input[type='number']");
  const qty = Math.max(0, parseInt(qtyInput ? qtyInput.value : "0", 10) || 0);

  if (qty <= 0) {
    showToast("⚠️ Please select a quantity first!");
    return;
  }

  const name = selectedModalCard.getAttribute("data-name");
  const priceText = selectedModalCard.getAttribute("data-price") || "₱0";
  const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
  const img = selectedModalCard.getAttribute("data-img") || "";

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existing = cart.find((item) => item.name === name);

  const maxQty = getMaxQtyForOrderType();
  if (maxQty !== Infinity) {
    const currentQty = getCartTotalQty();
    if (currentQty + qty > maxQty) {
      showBoxLimitToast();
      showToast(`Cannot add more than ${maxQty} cookies for this box.`);
      return;
    }
  }

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty, imgSrc: img });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();


  // If currently on cart page (rare), refresh UI
  if (document.getElementById("cart-items")) {
    displayCart();
  }

  // Reset modal quantity input back to 0 after adding
  if (qtyInput) qtyInput.value = 0;

  showToast(`Added to cart: ${name}`, { type: "success" });
}


// ================= notification =================

function showToast(message, options = {}) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  const isSuccess = options?.type === "success";

  // Reset classes each time
  toast.classList.remove("toast-success");
  toast.classList.add("toast");

  if (isSuccess) {
    toast.classList.add("toast-success");
    toast.innerHTML = `<span class="toast-success-text">✅ ${message}</span>`;
  } else {
    toast.textContent = message;
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


// ================= confirmation toast =================
function showConfirmToast(message, onConfirm) {
  const existing = document.getElementById("confirm-toast");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "confirm-toast";
  overlay.className = "confirm-toast-overlay";

  overlay.innerHTML = `
    <div class="confirm-toast-box">
      <p class="confirm-toast-message">${message}</p>

      <div class="confirm-toast-buttons">
        <button class="confirm-btn confirm-yes" id="confirm-yes">Yes, clear it</button>
        <button class="confirm-btn confirm-no" id="confirm-no">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // -------------------- force reflow then add active class for animation ------------------
  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  document.getElementById("confirm-yes").addEventListener("click", () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
    onConfirm();
  });

  document.getElementById("confirm-no").addEventListener("click", () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
  });

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
  let existing = cart.find((item) => item.name === name);

  // Enforce box limits for quick add buttons too
  const maxQty = getMaxQtyForOrderType();
  if (maxQty !== Infinity) {
    const currentQty = getCartTotalQty();
    const extraQty = 1; // quick add always +1
    if (currentQty + extraQty > maxQty) {
      showBoxLimitToast();
      showToast(`Cannot add more than ${maxQty} cookies for this box.`);
      return;
    }
  }

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, imgSrc });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // If on cart page, refresh UI
  if (document.getElementById("cart-items")) {
    displayCart();
  }

  // Keep your icons in toast ✅
  showToast(`Added to cart: ${name}`, { type: "success" });

  // -------------------- smooth scroll to cart section so user sees the update --------------------
  const cartSection = document.querySelector(".cart-section");
  if (cartSection) {
    cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ================= order page =================
function selectOrder(type) {
  localStorage.setItem("orderType", type);

  const messages = {
    "6pcs": "Box of 6 selected! 🍪",
    "8pcs": "Box of 8 selected! 🍪🍪",
    "12pcs": "Box of 12 selected! 🍪🍪🍪",
    "per piece": "Per piece order selected! 🍪",
  };

  showToast(messages[type] || "Order selected!");

  setTimeout(() => {
    window.location.href = "menu.html";
  }, 1000);
}

// ================= ORDER LIMITS =================
function getMaxQtyForOrderType() {
  const orderType = localStorage.getItem("orderType") || "";

  if (orderType === "6pcs") return 6;
  if (orderType === "8pcs") return 8;
  if (orderType === "12pcs") return 12;

  // pag per piece unlimited
  return Infinity;
}

function getCartTotalQty() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

function canAddQty(extraQty) {
  const maxQty = getMaxQtyForOrderType();
  if (maxQty === Infinity) return true;

  const currentQty = getCartTotalQty();
  return currentQty + extraQty <= maxQty;
}

function showBoxLimitToast() {
  const orderType = localStorage.getItem("orderType") || "";
  const limits = {
    "6pcs": 6,
    "8pcs": 8,
    "12pcs": 12,
  };

  const maxQty = limits[orderType];
  if (!maxQty) return;

  showToast(`You can only order up to ${maxQty} cookies for this box.`);
}

// ================= navigation =================
function goToShop() {
  window.location.href = "menu.html";
}

function goToOrderPage() {
  window.location.href = "order.html";
}

// ================= cart page =================
const deliveryRates = {
  ncr: { base: 50, minOrder: 300 },
};

function displayCart() {
  const cartContainer = document.getElementById("cart-items");
  const subtotalDisplay = document.getElementById("subtotal-price");
  const totalDisplay = document.getElementById("total-price");

  // The form page has more advanced delivery fee logic based on address
  const deliveryFee = 50;


  // -------------------- gumagana lang sa cart page --------------------
  if (!cartContainer) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
<div class="empty-cart-icon">🛒</div>

        <h3>Your cart is empty!</h3>
        <p>Looks like you haven't added any cookies yet.</p>

        <button class="hero-btn" onclick="location.href='menu.html'">
          🍪 Start Shopping
        </button>
      </div>
    `;

    if (subtotalDisplay) subtotalDisplay.textContent = "₱0";
    if (totalDisplay) totalDisplay.textContent = "₱" + deliveryFee;
    updateCartCount();
    return;
  }

  let subtotal = 0;
  cartContainer.innerHTML = "";

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;

    cartContainer.innerHTML += `
      <div class="cart-item">

        <img src="${item.imgSrc || "images/choco chip.jpg"}" 
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

  let total = subtotal + deliveryFee;

  if (subtotalDisplay) subtotalDisplay.textContent = "₱" + subtotal.toFixed(2);
  if (totalDisplay) totalDisplay.textContent = "₱" + total.toFixed(2);

  updateCartCount();
}

// ================= INCREASE QTY =================
function increaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const extraQty = 1;
  if (!canAddQty(extraQty)) {
    showBoxLimitToast();
    return;
  }

  cart[index].qty += extraQty;
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// ================= DECREASE QTY =================
function decreaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
    
    // -------------------- mawawala yung item pag nag reach ng 0 --------------------
  } else {
    cart.splice(index, 1);
    showToast("Item removed from cart!");
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

  showConfirmToast("Are you sure you want to clear your cart?", () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("orderType");
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
function displayCheckoutItems() {
  const checkoutContainer = document.getElementById("checkout-items");
  const orderTotals = document.getElementById("order-totals");
  const proceedBtn = document.getElementById("proceed-btn");
  const emptyMsg = document.getElementById("empty-cart-msg");

  if (!checkoutContainer) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ------------ empty cart ------------
  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (orderTotals) orderTotals.style.display = "none";
    if (proceedBtn) proceedBtn.disabled = true;
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (orderTotals) orderTotals.style.display = "block";
  if (proceedBtn) proceedBtn.disabled = false;

  // ------------ build items HTML and calculate subtotal ------------
  let subtotal = 0;
  let orderType = localStorage.getItem("orderType") || "";
  let itemsHTML = "";

if (orderType) {
  let cookieList = cart.map(item => item.name).join(", ");

  itemsHTML += `
    <div class="box-summary">
      <p><strong>
        ${orderType === "per piece" 
          ? "🍪 Your selected cookies per piece:" 
          : `🍪 Your box of ${orderType} contains:`}
      </strong></p>
      <p>${cookieList}</p>
      <hr>
    </div>
  `;
}
  cart.forEach((item) => {
    let itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    itemsHTML += `
      <div class="checkout-item">
        <img src="${item.imgSrc || "images/choco chip.jpg"}" 
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
  // Require Terms & Conditions agreement (per session) before opening checkout form.
  const alreadyAgreed = sessionStorage.getItem("termsAgreed") === "true";
  if (!alreadyAgreed) {
    openTermsModal();
    return;
  }

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
    let orderType = localStorage.getItem("orderType") || "";

    let summaryHTML = `<h4>📋 Order Summary</h4>`;

    if (orderType) { 
      summaryHTML += `
      <p class="box-message">
      🍪 Your box of ${orderType} contains:
      </p>
      `;
    }
    let cookieList = cart.map(item => item.name).join(", ");

    if (orderType && cookieList) {
      summaryHTML += `
        <p class="box-summary-text">
          (${cookieList})
        </p>
      `;
    }

    cart.forEach((item) => {
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

  const dateInput = document.getElementById("checkout-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  // ================= DELIVERY FEE =================
  const deliveryLocationEl = document.getElementById("delivery-location");
  const deliveryEl = document.getElementById("delivery-fee");
  const orderTotalEl = document.getElementById("order-total");
  const checkoutAddressEl = document.getElementById("checkout-address");

  // compute initial values
  const cartForFee = JSON.parse(localStorage.getItem("cart")) || [];
  const baseSubtotal = cartForFee.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addressContainsMarikina = () => {
    const address = String(checkoutAddressEl?.value || "").toLowerCase();
    return address.includes("marikina");
  };

  // Use same delivery rates as cart page (fallback to ₱50 if missing)
  const resolvedDeliveryFeeFromLocation = (locationValue) => {
    const location = String(locationValue || "ncr").toLowerCase();
    const rates = {
      ncr: { base: 50, minOrder: 300 },
    };

    const chosen = rates[location] || rates.ncr;
    
    // free delivery rules (by min order)
    if (baseSubtotal >= chosen.minOrder) return 0;
    return chosen.base;
  };

  const updateTotals = (fee) => {
    const safeFee = Number(fee) || 0;
    if (deliveryEl) deliveryEl.textContent = "₱" + safeFee.toFixed(2);
    if (orderTotalEl) {
      const total = baseSubtotal + safeFee;
      orderTotalEl.textContent = "₱" + total.toFixed(2);
    }
  };

  const refreshDeliveryFee = () => {

    // If nag enter user na taga Marikina sa address, delivery fee is FREE.
    if (addressContainsMarikina()) {
      updateTotals(0);
      return;
    }

    if (deliveryLocationEl) {
      const fee = resolvedDeliveryFeeFromLocation(deliveryLocationEl.value);
      updateTotals(fee);
      return;
    }

    // fallback to fixed base fee (current behavior)
    updateTotals(50);
  };

  // initial fee calculation on modal open
  refreshDeliveryFee();

  // for changes in delivery location or address input
  if (deliveryLocationEl) {
    deliveryLocationEl.addEventListener("change", refreshDeliveryFee);
  }
  if (checkoutAddressEl) {
    checkoutAddressEl.addEventListener("input", refreshDeliveryFee);
    checkoutAddressEl.addEventListener("change", refreshDeliveryFee);
  }

  // ===================== show modal =====================
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

// ================= TERMS MODAL =================
function openTermsModal() {
  const modal = document.getElementById("terms-modal");
  if (!modal) return;

  const checkbox = document.getElementById("terms-agree-checkbox");
  const errorEl = document.getElementById("terms-error");

  if (errorEl) errorEl.style.display = "none";
  if (checkbox) checkbox.checked = false;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeTermsModal() {
  const modal = document.getElementById("terms-modal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function agreeAndProceed() {

  // terms and conditions agreement (one time lang to per session)
  sessionStorage.setItem("termsAgreed", "true");

  const checkbox = document.getElementById("terms-agree-checkbox");

  const errorEl = document.getElementById("terms-error");

  if (!checkbox) return;

  if (!checkbox.checked) {
    if (errorEl) errorEl.style.display = "block";
    showToast("⚠️ Please agree to the Terms and Conditions.");
    return;
  }

  closeTermsModal();
  // After agreement, open the checkout modal normally
  openCheckoutModal();

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
function validateName(name) {
  // Letters + spaces only (no special characters)
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  return nameRegex.test(name);
}


// ------------- validate phone - exactly 11 digits, no letters ------------------
function validatePhone(phone) {
  const phoneClean = phone.replace(/[\s\-]/g, "");
  const phoneRegex = /^\d{11}$/;
  return phoneRegex.test(phoneClean);
}

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

  // ================= puwede lang delivery locs between ncr =================
  const ncrKeywords = [
    "ncr",
      "metro manila",
        "manila",
          "quezon city",
        "makati",
          "pasig",
        "taguig",
          "muntinlupa",
      "paranaque",
        "las piñas",
      "las pinas",
        "valenzuela",
          "malabon",
      "navotas",
        "caloocan",
      "marikina",
        "pasay",
      "pateros",
    "antipolo",
    "angono",
  ];

  const isNcr = (() => {
    const addr = String(address || "").toLowerCase();
    return ncrKeywords.some((k) => addr.includes(k));
  })();

  if (!isNcr) {
    showToast("❌ Delivery is available within NCR only. Please enter an NCR address.");
    document.getElementById("checkout-address").focus();
    return;
  }

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
    showToast(
      `⚠️ Phone number must be exactly 11 digits! (currently ${phoneClean.length})`
    );
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

    cart.forEach((item) => {
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

  // clear cart after order is placed
  localStorage.removeItem("cart");
  updateCartCount();

  // ================= RECEIPT POPULATE =================
  try {
    const receiptOrderNoEl = document.getElementById("receipt-order-no");
    const receiptDateEl = document.getElementById("receipt-date");
    const receiptNameEl = document.getElementById("receipt-name");
    const receiptPhoneEl = document.getElementById("receipt-phone");
    const receiptAddressEl = document.getElementById("receipt-address");
    const receiptDeliveryDateEl = document.getElementById("receipt-delivery-date");
    const receiptDeliveryTimeEl = document.getElementById("receipt-delivery-time");
    const receiptItemsEl = document.getElementById("receipt-items");
    const receiptSubtotalEl = document.getElementById("receipt-subtotal");
    const receiptDeliveryFeeEl = document.getElementById("receipt-delivery-fee");
    const receiptTotalEl = document.getElementById("receipt-total");

    if (
      receiptOrderNoEl && receiptDateEl && receiptNameEl && receiptPhoneEl &&
      receiptAddressEl && receiptDeliveryDateEl && receiptDeliveryTimeEl &&
      receiptItemsEl && receiptSubtotalEl && receiptDeliveryFeeEl && receiptTotalEl
    ) {
      const orderNumber = (() => {
        const existing = sessionStorage.getItem("lastOrderNumber");
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const rand = Math.floor(Math.random() * 9000) + 1000;
        const candidate = `DL-${yyyy}${mm}${dd}-${hh}${min}-${rand}`;
        sessionStorage.setItem("lastOrderNumber", candidate);
        return existing || candidate;
      })();

      const nowStr = new Date().toLocaleString();

      // totals
      receiptOrderNoEl.textContent = orderNumber;
      receiptDateEl.textContent = nowStr;
      receiptNameEl.textContent = name;
      receiptPhoneEl.textContent = phone;
      receiptAddressEl.textContent = address;
      receiptDeliveryDateEl.textContent = date;
      receiptDeliveryTimeEl.textContent = time;

      receiptItemsEl.innerHTML = cart
        .map((item) => {
          const lineTotal = item.price * item.qty;
          return `<div class="receipt-item">
            <span class="receipt-item-name">${item.name} × ${item.qty}</span>
            <span class="receipt-item-amount">₱${lineTotal.toFixed(2)}</span>
          </div>`;
        })
        .join("");

      receiptSubtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
      receiptDeliveryFeeEl.textContent = `₱${deliveryFee.toFixed(2)}`;
      receiptTotalEl.textContent = `₱${total.toFixed(2)}`;
    }
  } catch (e) {
    // don't break checkout if receipt fails
  }

  showToast("Order placed successfully! 🍪");

}

// ================= receipt printing =================
function openReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
}

function printReceipt() {
  const receiptEl = document.getElementById("receipt");
  if (!receiptEl) return;

  const originalTitle = document.title;
  try {
    document.title = "Dough LEYcious Receipt";
    window.print();
  } finally {
    document.title = originalTitle;
  }
}


// ================= total =================
function getTotal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ================= Back to top button =================
(function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  const toggle = () => {
    if (window.scrollY > 300) btn.classList.add("show");
    else btn.classList.remove("show");
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

  // ================= hamburger menu (slide down) =================

  // Works across all pages that have navbar and doesn't throw errors on pages without it
  document.querySelectorAll(".navbar").forEach((navbar) => {
    const btn = navbar.querySelector(".nav-toggle-btn");
    const links = navbar.querySelector(".nav-links");
    if (!btn || !links) return;

    // start closed
    links.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");

    const toggle = () => {
      const isOpen = links.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    // close when clicking a menu option
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
      });
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
      if (!navbar.contains(e.target)) {
        links.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
  // ---- update cart count on every page ----
  updateCartCount();

  // cart page
  if (document.getElementById("cart-items")) {
    displayCart();
  }

  // checkout/form page
  if (document.getElementById("checkout-items")) {
    displayCheckoutItems();
  }


  // ================= cookie modal listeners (with null check) =================
  const ingredientModal = document.getElementById("ingredientModal");
  if (ingredientModal) {
    ingredientModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeIngredientModal();
      }
    });

    //modal quantity + / - buttons
    const qtyInput = ingredientModal.querySelector(".quantity input[type='number']");
    const plusBtn = ingredientModal.querySelector(".quantity .plus");
    const minusBtn = ingredientModal.querySelector(".quantity .minus");

    const getQty = () => Math.max(0, parseInt(qtyInput?.value, 10) || 0);
    const setQty = (v) => {
      if (!qtyInput) return;
      qtyInput.value = String(Math.max(0, v));
    };

    if (plusBtn) {
      plusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setQty(getQty() + 1);
      });
    }

    if (minusBtn) {
      minusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setQty(getQty() - 1);
      });
    }
  }


  // ================= shop page product card listeners =================
  const productCards = document.querySelectorAll(".product-card");

  if (productCards.length > 0) {
    productCards.forEach((card) => {
      const input = card.querySelector("input");
      const plus = card.querySelector(".plus");
      const minus = card.querySelector(".minus");
      const addBtn = card.querySelector(".add-to-cart-btn");

      if (plus) {
        plus.addEventListener("click", (e) => {
          e.stopPropagation();
          input.value = (parseInt(input.value) || 0) + 1;
        });
      }

      if (minus) {
        minus.addEventListener("click", (e) => {
          e.stopPropagation();
          if (parseInt(input.value) > 0) {
            input.value = parseInt(input.value) - 1;
          }
        });
      }

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

          const img = card.querySelector("img");
          const imgSrc = img ? img.src : "";

          const maxQty = getMaxQtyForOrderType();

          // Enforce limit BEFORE committing the add (so user doesn't lose their selected quantity if they exceed the box limit)
          if (maxQty !== Infinity) {
            const currentQty = getCartTotalQty();
            if (currentQty + qty > maxQty) {
              showBoxLimitToast();
              showToast(`Cannot add more than ${maxQty} cookies for this box.`);
              return;
            }
          }

          let cart = JSON.parse(localStorage.getItem("cart")) || [];
          let existing = cart.find((item) => item.name === name);

          if (existing) {
            existing.qty += qty;
          } else {
            cart.push({ name, price, qty, imgSrc });
          }

          localStorage.setItem("cart", JSON.stringify(cart));

          updateCartCount();

          input.value = 0;

          showToast(`Added to cart: ${name}`, { type: "success" });


        });
      }
    });
  }

  // ================= checkout modal listeners =================
  document.addEventListener("click", function (e) {
    const checkoutModal = document.getElementById("checkout-modal");
    const successModal = document.getElementById("success-modal");
    const termsModal = document.getElementById("terms-modal");

    if (e.target === checkoutModal) {
      closeCheckoutModal();
    }
    if (e.target === successModal) {
      closeSuccessModal();
    }
    if (termsModal && e.target === termsModal) {
      closeTermsModal();
    }
  });

  // ================= ESC key closes all modals =================
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeIngredientModal();
      closeCheckoutModal();
      closeTermsModal();
      closeSuccessModal();
      closeReceiptModal();
    }
  });

  // ================= Full Name block numbers in real-time =================
  const nameInput = document.getElementById("checkout-name");

  // pinipigilan niya yung number keys from being typed and show real-time feedback
  if (nameInput) {
    nameInput.addEventListener("keypress", function (e) {
      if (/\d/.test(e.key)) {
        e.preventDefault();
        showToast("⚠️ Name should contain letters only, no numbers!");
      }
    });

    nameInput.addEventListener("input", function () {
      if (containsNumbers(this.value)) {
        showToast("⚠️ Name should contain letters only, no numbers!");
        this.value = this.value.replace(/\d/g, "");
      }
    });
  }

  // ================= Phone Number: block letters in real-time =================
  const phoneInput = document.getElementById("checkout-phone");
  if (phoneInput) {
    phoneInput.addEventListener("keypress", function (e) {
      if (/[A-Za-z]/.test(e.key)) {
        e.preventDefault();
        showToast("⚠️ Phone number should contain numbers only!");
      }
    });

    // pinipigilan niya yung letter keys na ma-type just in case may user na mag t-type ng letters, may real-time feedback
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
    phoneInput.addEventListener("blur", function () {
      const digitsOnly = this.value.replace(/\D/g, "");
      if (digitsOnly.length > 0 && digitsOnly.length !== 11) {
        showToast(`⚠️ Phone number must be exactly 11 digits! (currently ${digitsOnly.length})`
        );
      }
    });
  }
