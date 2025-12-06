import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import routes
import medicineRoutes from "./routes/medicineRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";



const app = express();

// ✅ Enable CORS
app.use(
  cors({
    origin: [
      "https://medifind-iul6.onrender.com", // ✅ your deployed frontend
      "http://localhost:5173",               // ✅ for local development
    ],
    credentials: true, // ✅ allow cookies, headers, tokens, etc.
  })
);

// ✅ Middleware
app.use(cookieParser());
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ Routes
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api", searchRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/ai", aiRoutes);

export default app;
