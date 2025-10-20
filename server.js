const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const MessageSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", MessageSchema);

app.post("/api/messages", async (req, res) => {
  try {
    const msg = new Message({ message: req.body.message });
    await msg.save();
    res.json({ success: true, msg: "💖 Tin nhắn đã lưu" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => res.send("❤️ Server đang hoạt động!"));

module.exports = app; // ✅ Bắt buộc có dòng này
