document.addEventListener('DOMContentLoaded', () => {
  // Inject Cart Modal HTML
  const cartModalHTML = `
    <div id="cart-modal" class="cart-modal" style="display: none; position: fixed; top: 0; right: 0; width: 420px; max-width: 100%; height: 100vh; background: rgba(20, 20, 42, 0.95); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-left: 1px solid var(--border); box-shadow: -10px 0 35px rgba(0,0,0,0.5); z-index: 1000; flex-direction: column; transition: transform 0.3s ease;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid var(--border);">
        <h2 style="font-size: 1.4rem; margin: 0; font-family: 'Outfit', sans-serif; font-weight: 600; background: linear-gradient(135deg, var(--primary-mid), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Your Cart</h2>
        <button id="close-cart" style="background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--text-muted); line-height: 1; transition: color 0.2s;">&times;</button>
      </div>
      <div id="cart-items" style="flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Cart items will be injected here -->
      </div>
      <div style="padding: 2rem; border-top: 1px solid var(--border); background: var(--bg-surface);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-weight: 600; font-size: 1.2rem; color: var(--text-color);">
          <span style="font-weight: 500; color: var(--text-muted);">Total:</span>
          <span id="cart-total" style="color: var(--text-color);">₹0</span>
        </div>
        <button id="checkout-btn" class="btn" style="width: 100%; padding: 1rem; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-radius: 8px;">Proceed to Checkout</button>
      </div>
    </div>
    <div id="cart-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(13, 13, 26, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 999;"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', cartModalHTML);

  const closeCartBtn = document.getElementById('close-cart');
  if (closeCartBtn) {
    closeCartBtn.style.outline = 'none';
    closeCartBtn.addEventListener('mouseenter', () => { closeCartBtn.style.color = 'var(--text-color)'; });
    closeCartBtn.style.transition = 'color 0.2s ease';
    closeCartBtn.addEventListener('mouseleave', () => { closeCartBtn.style.color = 'var(--text-muted)'; });
  }

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
      cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem; font-size: 0.95rem;">Your cart is empty.</p>';
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
      itemEl.style.paddingBottom = '1rem';
      itemEl.style.borderBottom = '1px solid rgba(124, 58, 237, 0.15)';
      itemEl.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: center; width: 100%;">
          <img src="${item.img || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=100&q=80'}" alt="${item.title}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: var(--text-color); font-weight: 500; font-family: 'Outfit', sans-serif;">${item.title}</h4>
            <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem; font-family: 'Inter', sans-serif;">${item.price} &times; ${item.quantity}</p>
          </div>
          <button class="remove-item" data-index="${index}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; transition: color 0.2s ease; outline: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    cartTotalEl.textContent = '₹' + total.toLocaleString('en-IN');
    
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.color = '#ef4444'; });
      btn.addEventListener('mouseleave', () => { btn.style.color = 'var(--text-muted)'; });
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
      const img = productCard.querySelector('.product-img') ? productCard.querySelector('.product-img').src : '';

      let cart = JSON.parse(localStorage.getItem('ff_cart')) || [];
      
      const existingItem = cart.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id: productId, title, price, img, quantity: 1 });
      }

      localStorage.setItem('ff_cart', JSON.stringify(cart));
      updateCartCount();
      
      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = 'ADDED';
      btn.style.backgroundColor = 'var(--text-color)';
      btn.style.color = 'var(--bg-color)';
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
