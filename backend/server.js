require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier"); // ✅ Needed for Cloudinary Stream Uploads

// ✅ Import Routes
const productRoutes = require("./productRoutes");
const orderRoutes = require("./orderRoutes");
const Product = require("./product");
const Order = require("./order");

// ✅ Initialize Express App
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS Middleware (Allow Requests from Vercel Frontend)
app.use(
  cors({
    origin: "https://vdeckshop.vercel.app", // ✅ Allow your frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✔️ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ Multer Configuration (Memory Storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Cloudinary Upload Function (Returns a Promise)
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// ✅ Use Modular Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Default Route
app.get("/", (req, res) => res.send("🚀 VDECK API is running..."));

// ✅ API to Add Product (Uploads Images to Cloudinary)
app.post("/api/products", upload.array("images", 6), async (req, res) => {
  try {
    console.log("📡 Received Data:", req.body);

    const { name, price, description, category } = req.body;
    if (!name || !price || !category || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: "❌ Missing required fields or images." });
    }

    // ✅ Upload Images to Cloudinary
    const imageUrls = await Promise.all(req.files.map(file => uploadToCloudinary(file.buffer, "product-images")));

    // ✅ Save product to database
    const product = new Product({ name, price, description, category, images: imageUrls });
    await product.save();

    res.status(201).json({ message: "✅ Product added successfully!", product });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    res.status(500).json({ error: "❌ Internal Server Error" });
  }
});

// ✅ API to Get a Single Product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "❌ Product not found." });
    }
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ error: "❌ Internal Server Error" });
  }
});

// ✅ API to Place an Order (Uploads Payment Proof to Cloudinary)
app.post("/api/orders", upload.single("paymentProof"), async (req, res) => {
  try {
    const { fullname, gcash, address, items, total } = req.body;

    if (!fullname || !gcash || !address || !items || !total || !req.file) {
      return res.status(400).json({ error: "❌ Please fill in all required fields and upload payment proof." });
    }

    // ✅ Upload Payment Proof to Cloudinary
    const paymentProofUrl = await uploadToCloudinary(req.file.buffer, "payment-proofs");

    const newOrder = new Order({
      fullname,
      gcash,
      address,
      items: JSON.parse(items),
      total,
      paymentProof: paymentProofUrl,
    });

    await newOrder.save();
    res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    res.status(500).json({ error: "❌ Internal Server Error", details: error.message });
  }
});

// ✅ Global Error Handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "❌ Internal Server Error" });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));


