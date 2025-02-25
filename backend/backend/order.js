const mongoose = require("mongoose");

// ✅ Define Order Schema (with timestamps)
const orderSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    gcash: { type: String, required: true },
    address: { type: String, required: true },
    items: { type: Array, required: true },
    total: { type: Number, required: true },
    paymentProof: { type: String, required: true } // ✅ Store Cloudinary URL
}, { timestamps: true });

// ✅ Prevent OverwriteModelError
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;
