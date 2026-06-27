document.addEventListener('DOMContentLoaded', () => {
  // Inject Cart Modal HTML
  const cartModalHTML = `
    <div id="cart-modal" class="cart-modal" style="display: none; position: fixed; top: 0; right: 0; width: 400px; max-width: 100%; height: 100vh; background: var(--secondary-color); box-shadow: -5px 0 15px rgba(0,0,0,0.1); z-index: 1000; flex-direction: column; transition: transform 0.3s ease;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 2rem; border-bottom: 1px solid #eee;">
        <h2 style="font-size: 1.5rem; margin: 0;">Your Cart</h2>
        <button id="close-cart" style="background: none; border: none; font-size: 2rem; cursor: pointer;">&times;</button>
      </div>
      <div id="cart-items" style="flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
        <!-- Cart items will be injected here -->
      </div>
      <div style="padding: 2rem; border-top: 1px solid #eee; background: #fff;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 600; font-size: 1.2rem;">
          <span>Total:</span>
          <span id="cart-total">₹0</span>
        </div>
        <button id="checkout-btn" class="btn" style="width: 100%;">Proceed to Checkout</button>
      </div>
    </div>
    <div id="cart-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 999;"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', cartModalHTML);

  const cartModal = document.getElementById('cart-modal');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');

  // Toggle Cart
  const toggleCart = () => {
    const isVisible = cartModal.style.display === 'flex';
    cartModal.style.display = isVisible ? 'none' : 'flex';
    cartOverlay.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) renderCart();
  };

  document.getElementById('close-cart').addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);
  
  const cartIcon = document.querySelector('.cart-icon');
  if(cartIcon) {
    cartIcon.style.cursor = 'pointer';
    cartIcon.addEventListener('click', toggleCart);
  }

  // Update cart count
  const updateCartCount = () => {
    let cart = JSON.parse(localStorage.getItem('ff_cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
      el.textContent = count;
    });
  };

  // Render Cart
  const renderCart = () => {
    let cart = JSON.parse(localStorage.getItem('ff_cart')) || [];
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); margin-top: 2rem;">Your cart is empty.</p>';
      cartTotalEl.textContent = '₹0';
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
      total += priceNum * item.quantity;
      
      const itemEl = document.createElement('div');
      itemEl.style.display = 'flex';
      itemEl.style.justifyContent = 'space-between';
      itemEl.style.alignItems = 'center';
      itemEl.innerHTML = `
        <div style="flex: 1;">
          <h4 style="margin: 0 0 0.5rem 0;">${item.title}</h4>
          <p style="margin: 0; color: var(--text-light);">${item.price} x ${item.quantity}</p>
        </div>
        <button class="remove-item btn-outline" data-index="${index}" style="padding: 0.25rem 0.75rem; border-color: #ccc; font-size: 0.8rem;">Remove</button>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    cartTotalEl.textContent = '₹' + total.toLocaleString('en-IN');
    
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.index;
        cart.splice(idx, 1);
        localStorage.setItem('ff_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
      });
    });
  };

  // Checkout btn
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      let cart = JSON.parse(localStorage.getItem('ff_cart')) || [];
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  // Checkout Page Logic
  const checkoutItemsContainer = document.getElementById('checkout-items');
  if (checkoutItemsContainer) {
    let cart = JSON.parse(localStorage.getItem('ff_cart')) || [];
    let total = 0;
    
    if (cart.length === 0) {
      checkoutItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
      document.getElementById('checkout-total').textContent = '₹0';
    } else {
      cart.forEach(item => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
        total += priceNum * item.quantity;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'checkout-item';
        itemEl.innerHTML = `
          <div>
            <span style="font-weight: 500;">${item.title}</span> <span style="color: var(--text-light);">x ${item.quantity}</span>
          </div>
          <div>${item.price}</div>
        `;
        checkoutItemsContainer.appendChild(itemEl);
      });
      document.getElementById('checkout-total').textContent = '₹' + total.toLocaleString('en-IN');
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (cart.length === 0) {
          alert("Your cart is empty!");
          return;
        }
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const gatewayName = paymentMethod === 'razorpay' ? 'Razorpay' : 'Cashfree';
        alert(`Redirecting to ${gatewayName} secure payment gateway to pay ₹${total.toLocaleString('en-IN')}...`);
        // Optional: clear cart on successful mock payment
        // localStorage.removeItem('ff_cart'); 
      });
    }
  }

  // Add to cart buttons
  const addToCartBtns = document.querySelectorAll('.add-to-cart');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productCard = e.target.closest('.product-card');
      const productId = productCard.dataset.id;
      const title = productCard.querySelector('.product-title').textContent;
      const price = productCard.querySelector('.product-price').textContent;

      let cart = JSON.parse(localStorage.getItem('ff_cart')) || [];
      
      const existingItem = cart.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id: productId, title, price, quantity: 1 });
      }

      localStorage.setItem('ff_cart', JSON.stringify(cart));
      updateCartCount();
      
      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = 'ADDED';
      btn.style.backgroundColor = 'var(--text-color)';
      btn.style.color = 'var(--secondary-color)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--text-color)';
      }, 1000);
      
      // Open cart automatically
      if (cartModal.style.display !== 'flex') {
        toggleCart();
      } else {
        renderCart();
      }
    });
  });

  // Initial cart count load
  updateCartCount();
});
