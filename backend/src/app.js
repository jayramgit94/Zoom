import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8001);
app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use("/api/v1/user", userRoutes);

// MongoDB Connection with Production Optimizations
const connectDB = async () => {
  try {
    const connectionOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
      family: 4, // Use IPv4, skip IPv6 if not available
    };

    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log("🔄 Retrying MongoDB connection...");
      connectDB();
    }, 5000);
    return false;
  }
};

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

const start = async () => {
  // Connect to MongoDB first
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.warn("⚠️ Starting server without DB (will retry connection)");
  }

  server.listen(app.get("port"), () => {
    console.log(`🚀 Server running on port ${app.get("port")}`);
  });
};

start();

export default app;
