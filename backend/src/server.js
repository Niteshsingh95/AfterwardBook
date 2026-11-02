import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes.js";
const app = express();
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get("/api/health", (_q, s) => s.json({ ok: true, name: "Afterword API" }));
app.use("/api", routes);
app.use((e, _q, s, _n) => {
  console.error(e);
  s.status(e.status || 500).json({ message: e.message || "Server error" });
});
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/afterword")
  .then(() =>
    app.listen(port, () =>
      console.log(`Afterword API running at http://localhost:${port}`),
    ),
  )
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });
