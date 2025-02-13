document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        alert("❌ Product ID is missing!");
        window.location.href = "index.html";
        return;
    }

    try {
        // ✅ Fetch a single product using its ID
        const response = await fetch(`http://localhost:4000/api/products/${productId}`);

        if (!response.ok) {
            throw new Error(`❌ API Error: ${response.status} - ${response.statusText}`);
        }

        const product = await response.json();

        if (!product || !product.images || product.images.length === 0) {
            alert("❌ Product images not found!");
            window.location.href = "index.html";
            return;
        }

        // ✅ Set Product Information
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-price").textContent = `₱${product.price.toFixed(2)}`;
        document.getElementById("product-description").textContent = product.description || "No description available.";

        // ✅ Set Main Product Image (Fix: Use Absolute Path)
        const mainImage = document.getElementById("main-product-image");
        mainImage.src = `http://localhost:4000${product.images[0]}`; // Fixed path
        mainImage.onerror = () => (mainImage.src = "placeholder.jpg");

        // ✅ Generate Thumbnails for All Images (Fix: Use Absolute Paths)
        const thumbnailsContainer = document.getElementById("thumbnails");
        thumbnailsContainer.innerHTML = "";

        product.images.forEach((img, index) => {
            const imgElement = document.createElement("img");
            imgElement.src = `http://localhost:4000${img}`; // Fixed path
            imgElement.classList.add("thumbnail");
            imgElement.alt = `Thumbnail ${index + 1}`;
            imgElement.onerror = () => (imgElement.src = "placeholder.jpg");

            // ✅ Clicking a thumbnail updates the main image with a smooth transition
            imgElement.onclick = () => {
                mainImage.style.opacity = 0;
                setTimeout(() => {
                    mainImage.src = `http://localhost:4000${img}`;
                    mainImage.style.opacity = 1;
                }, 200);
            };

            thumbnailsContainer.appendChild(imgElement);
        });

    } catch (error) {
        console.error("❌ Error fetching product:", error);
        alert("❌ Failed to load product details.");
        window.location.href = "index.html";
    }
});


// ✅ Quantity Controls
function incrementQuantity() {
    let quantityInput = document.getElementById("quantity");
    quantityInput.value = parseInt(quantityInput.value, 10) + 1;
}

function decrementQuantity() {
    let quantityInput = document.getElementById("quantity");
    if (parseInt(quantityInput.value, 10) > 1) {
        quantityInput.value = parseInt(quantityInput.value, 10) - 1;
    }
}

// ✅ Add to Cart from Details Page
function addToCartFromDetails() {
    const productId = new URLSearchParams(window.location.search).get("id");
    const quantity = parseInt(document.getElementById("quantity").value, 10);

    if (!productId || isNaN(quantity) || quantity <= 0) {
        alert("❌ Invalid product or quantity.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: document.getElementById("product-name").textContent,
            price: parseFloat(document.getElementById("product-price").textContent.replace("₱", "")),
            quantity
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Product added to cart!");
}
