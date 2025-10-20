// Load local .env if available
try {
  require("dotenv").config();
} catch (e) {
  /* ignore */
}
const mongoose = require("mongoose");

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

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected (cached)");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
    throw err;
  }
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const MessageSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

module.exports = async (req, res) => {
  // Basic CORS handling for OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({ success: false, error: "Method not allowed" })
    );
  }

  try {
    await connectDB();
    const body = await getBody(req);
    const msg = body.message;
    if (!msg) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(
        JSON.stringify({ success: false, error: "message is required" })
      );
    }
    const saved = await new Message({ message: msg }).save();
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({ success: true, msg: "💌 Tin nhắn đã được lưu" })
    );
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ success: false, error: err.message }));
  }
};
