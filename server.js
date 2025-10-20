const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Kết nối MongoDB (Render cho phép connect trực tiếp)
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://thanhthanhne:thanhthanhne@cluster0.ib0nvnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
}
connectDB();

const MessageSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

app.post("/api/messages", async (req, res) => {
  try {
    await connectDB();
    const msg = new Message({ message: req.body.message });
    await msg.save();
    res.json({ success: true, msg: "💖 Tin nhắn đã lưu" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => res.send("❤️ Server đang hoạt động!"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
