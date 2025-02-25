const mongoose = require("mongoose");

// ✅ Define Product Schema (with timestamps)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    images: [String], // ✅ Stores Cloudinary URLs
}, { timestamps: true }); // ✅ Adds createdAt & updatedAt automatically

// ✅ Prevent OverwriteModelError
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;

