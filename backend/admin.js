document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productContainer = document.getElementById("product-list");

    if (!productForm || !productContainer) {
        console.error("❌ Form or product container not found!");
        return;
    }

    const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dpf2qgois/upload";
    const CLOUDINARY_UPLOAD_PRESET = "vdeck_preset"; // ✅ Make sure this exists in Cloudinary

    // ✅ Fetch products from the API and display them
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            if (!response.ok) throw new Error("❌ Failed to fetch products.");

            const products = await response.json();
            console.log("📦 Products from DB:", products);
            renderProducts(products);
        } catch (error) {
            console.error("❌ Error fetching products:", error);
        }
    }

    // ✅ Render products dynamically
    function renderProducts(products) {
        productContainer.innerHTML = "";
        products.forEach((product) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${product.images?.[0] || 'placeholder.jpg'}" 
                     alt="${product.name}" 
                     width="100" 
                     onerror="this.src='placeholder.jpg'">

                <div>
                    <strong>${product.name}</strong> - ₱${product.price} (${product.category})
                    <p>${product.description || 'No description available'}</p>
                </div>
            `;

            // Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "✏️ Edit";
            editButton.addEventListener("click", () => editProduct(product._id));

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑 Delete";
            deleteButton.addEventListener("click", () => deleteProduct(product._id));

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            productContainer.appendChild(li);
        });
    }

    // ✅ Delete Product
    window.deleteProduct = async (id) => {
        console.log("🛠 Deleting Product ID:", id);

        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "DELETE",
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) throw new Error("❌ Failed to delete product.");

            alert("✅ Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("❌ Error deleting product:", error);
            alert(error.message);
        }
    };

    // ✅ Upload Image to Cloudinary
    async function uploadImageToCloudinary(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || "Cloudinary upload failed");
            }

            console.log("📸 Cloudinary response:", data);
            return data.secure_url; // ✅ Return the uploaded image URL
        } catch (error) {
            console.error("❌ Image upload error:", error);
            return null; // ✅ Return null on failure
        }
    }

    // ✅ Handle Product Submission
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("product-name").value.trim();
        const price = parseFloat(document.getElementById("product-price").value.trim());
        const description = document.getElementById("product-description").value.trim();
        const category = document.getElementById("product-category").value;
        const mainImageFile = document.getElementById("product-image").files[0];
        const additionalImages = document.querySelectorAll(".additional-image");

        if (!name || isNaN(price) || !category || !mainImageFile) {
            alert("❌ Please fill in all required fields.");
            return;
        }

        let imageUrls = [];

        // ✅ Upload Main Image
        const mainImageUrl = await uploadImageToCloudinary(mainImageFile);
        if (!mainImageUrl) {
            alert("❌ Failed to upload main image.");
            return;
        }
        imageUrls.push(mainImageUrl);

        // ✅ Upload Additional Images
        for (const input of additionalImages) {
            if (input.files.length > 0) {
                const uploadedUrl = await uploadImageToCloudinary(input.files[0]);
                if (uploadedUrl) imageUrls.push(uploadedUrl);
            }
        }

const productData = {
    name,
    price,
    description,
    category,
    images: imageUrls, // Ensure it's an array
};

console.log("📡 Sending Product Data:", JSON.stringify(productData, null, 2)); // ✅ Log data before sending

try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(productData),
    });

    const result = await response.json();
    console.log("✅ Backend Response:", result);

    if (!response.ok) {
        console.error("❌ Backend Error:", result);
        throw new Error(result.error || "❌ Failed to save product.");
    }

    alert("✅ Product saved successfully!");
    productForm.reset();
    fetchProducts();
} catch (error) {
    console.error("❌ Error saving product:", error);
    alert("❌ Failed to save product.");
}

    });

    fetchProducts();
});
