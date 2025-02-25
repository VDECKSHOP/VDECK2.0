const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Product = require("./product");

const router = express.Router();

// ✅ Multer Configuration (Memory Storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload to Cloudinary Function
const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// ✅ Get All Products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch products" });
    }
});

// ✅ Add a Product (Uploads images to Cloudinary)
router.post("/", upload.array("images", 6), async (req, res) => {
    try {
        const { name, price, category, description } = req.body;

        if (!name || !price || !category || req.files.length === 0) {
            return res.status(400).json({ error: "❌ Please fill in all fields and upload at least one image." });
        }

        // ✅ Upload images to Cloudinary
        const imageUrls = await Promise.all(
            req.files.map((file) => uploadToCloudinary(file.buffer, "product-images"))
        );

        // ✅ Save Product to MongoDB
        const product = new Product({ name, price, category, description, images: imageUrls });
        await product.save();

        res.json({ message: "✅ Product added successfully!", product });
    } catch (error) {
        res.status(500).json({ error: "❌ Failed to add product", details: error.message });
    }
});

// ✅ DELETE a Product by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "❌ Product not found." });
        }
        res.json({ message: "✅ Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Server error", details: error.message });
    }
});

module.exports = router;

