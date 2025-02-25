document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    renderCart();
});

// ✅ Fetch products from MongoDB and display them
async function loadProducts() {
    try {
        const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend
        const response = await fetch(`${API_BASE_URL}/api/products`); // ✅ Updated API URL
        
        if (!response.ok) {
            throw new Error("❌ Failed to fetch products.");
        }

        const products = await response.json();
        console.log("📦 Products from DB:", products);
        renderProducts(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}

// ✅ Render products dynamically with Cloudinary image fix
function renderProducts(products) {
    const playingCardsContainer = document.getElementById("playing-cards");
    const pokerChipsContainer = document.getElementById("poker-chips");
    const accessoriesContainer = document.getElementById("accessories");

    if (!playingCardsContainer || !pokerChipsContainer || !accessoriesContainer) return;

    playingCardsContainer.innerHTML = "";
    pokerChipsContainer.innerHTML = "";
    accessoriesContainer.innerHTML = "";

    products.forEach((product) => {
        const category = product.category ? product.category.toLowerCase() : "";

        // ✅ Fix Cloudinary image display
        const imageUrl = product.images?.[0]?.startsWith("http") 
            ? product.images[0] 
            : `https://vdeck.onrender.com${product.images?.[0]}`;

        const productHTML = `
        <div class="product">
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 onerror="this.src='placeholder.jpg'">
            <h3>${product.name}</h3>
            <p>₱${product.price.toFixed(2)}</p>
            <div class="button-container">
                <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price})">🛒 Add to Cart</button>
                <button class="view-details-btn" onclick="window.location.href='product-details.html?id=${product._id}'">🔍 View Details</button>
            </div>
        </div>`;

        if (category === "playing-cards") {
            playingCardsContainer.insertAdjacentHTML("beforeend", productHTML);
        } else if (category === "poker-chips") {
            pokerChipsContainer.insertAdjacentHTML("beforeend", productHTML);
        } else if (category === "accessories") {
            accessoriesContainer.insertAdjacentHTML("beforeend", productHTML);
        }
    });
}

// ✅ Add to Cart Function
window.addToCart = (id, name, price) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
    renderCart();
};

// ✅ Render Cart Function (Updates Order Form)
function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartCountSpan = document.getElementById("cart-count");
    const selectedProductTextArea = document.getElementById("selected-product");
    const orderTotalInput = document.getElementById("order-total");

    if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan || !selectedProductTextArea || !orderTotalInput) {
        console.error("❌ One or more cart elements not found!");
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;
    let orderSummaryText = "";

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${index})">❌ Remove</button>
        `;
        cartItemsContainer.appendChild(li);
        total += item.price * item.quantity;
        orderSummaryText += `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}\n`;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    selectedProductTextArea.value = orderSummaryText.trim();
    orderTotalInput.value = total.toFixed(2);
}

// ✅ Remove Item from Cart
window.removeFromCart = (index) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (index >= 0 && index < cart.length) {
        const removedProduct = cart.splice(index, 1)[0];
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        alert(`${removedProduct.name} removed from cart!`);
    }
};

// ✅ Handle Order Submission
document.getElementById("order-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const gcash = document.getElementById("gcash").value.trim();
    const address = document.getElementById("address").value.trim();
    const orderTotal = document.getElementById("order-total").value;
    const paymentProof = document.getElementById("payment-proof").files[0];

    // ✅ Fix: Convert "selected-product" text to a JSON array
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!fullname || !gcash || !address || cart.length === 0 || !orderTotal || !paymentProof) {
        alert("❌ Please complete all fields.");
        return;
    }

    // ✅ Convert cart items to JSON string before sending
    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("gcash", gcash);
    formData.append("address", address);
    formData.append("items", JSON.stringify(cart)); // ✅ Send JSON array
    formData.append("total", orderTotal);
    formData.append("paymentProof", paymentProof);

    try {
        const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend

        const response = await fetch(`${API_BASE_URL}/api/orders`, { // ✅ Updated API URL
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "❌ Failed to place order.");

        alert("✅ Order placed successfully!");
        localStorage.removeItem("cart"); // ✅ Clear cart after order
        renderCart();
        document.getElementById("order-form").reset(); // ✅ Reset form without redirecting
    } catch (error) {
        console.error("❌ Order Submission Error:", error);
        alert("❌ Failed to place order.");
    }
});

// ✅ Smooth Scrolling for Product Slider
document.addEventListener("DOMContentLoaded", () => {
    const sliders = document.querySelectorAll(".slider-container");

    sliders.forEach(slider => {
        const wrapper = slider.querySelector(".slider-wrapper");
        const prevBtn = slider.querySelector(".prev-btn");
        const nextBtn = slider.querySelector(".next-btn");

        if (!wrapper || !prevBtn || !nextBtn) return;

        prevBtn.addEventListener("click", () => {
            wrapper.scrollBy({ left: -300, behavior: "smooth" });
        });

        nextBtn.addEventListener("click", () => {
            wrapper.scrollBy({ left: 300, behavior: "smooth" });
        });
    });
});
