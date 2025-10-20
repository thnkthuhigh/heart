const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://thanhthanhne:thanhthanhne@cluster0.ib0nvnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// 🔥 Tạo kết nối cache để tránh reconnect nhiều lần (Vercel cần dòng này)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected (cached)");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
}
connectDB();

// Schema & API
const MessageSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

app.post("/api/messages", async (req, res) => {
  try {
    await connectDB(); // đảm bảo mỗi request có DB
    const msg = new Message({ message: req.body.message });
    await msg.save();
    res.json({ success: true, msg: "💖 Tin nhắn đã lưu" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => res.send("❤️ Server đang hoạt động!"));

module.exports = app;
