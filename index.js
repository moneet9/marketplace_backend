import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define a simple schema
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

const Item = mongoose.model("Itemedited", itemSchema);

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Backend is live!");
});

app.post("/add", async (req, res) => {
  try {
    const { title, description } = req.body;
    const newItem = new Item({ title, description });
    await newItem.save();
    res.status(201).json({ message: "✅ Item saved!", data: newItem });
  } catch (err) {
    res.status(500).json({ message: "❌ Error saving item", error: err });
  }
});

app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
