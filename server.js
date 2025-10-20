// Load local .env if available (safe require so it won't crash if dotenv isn't installed)
try {
  require("dotenv").config();
} catch (e) {
  /* dotenv not installed, ignore */
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Prefer a valid environment-provided URI. If it's missing or looks like a placeholder,
// fall back to the default. Trim to avoid stray whitespace/newlines.
const rawEnvUri = (process.env.MONGODB_URI || "").trim();
const fallbackUri =
  "mongodb+srv://thanhthanhne:thanhthanhne@cluster0.ib0nvnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
function isValidMongoUri(u) {
  return (
    typeof u === "string" &&
    /^mongodb(?:\+srv)?:\/\/.+/.test(u) &&
    !/^your_?/.test(u)
  );
}
let uri;
if (isValidMongoUri(rawEnvUri)) {
  uri = rawEnvUri;
  console.log("Using MONGODB_URI from environment");
} else {
  if (rawEnvUri) {
    console.warn(
      "⚠️ Ignoring invalid MONGODB_URI in environment. Using fallback connection string."
    );
  } else {
    console.warn("⚠️ MONGODB_URI not set. Using fallback connection string.");
  }
  uri = fallbackUri;
}

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
