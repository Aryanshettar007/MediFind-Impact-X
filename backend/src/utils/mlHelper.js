import axios from "axios";

const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:5001";
const ML_TIMEOUT = 10000; // 10 seconds

export const getMLScores = async (pharmacies) => {
  try {
    // First check if ML service is running
    const healthCheck = await axios.get(`${ML_API_URL}/health`, {
      timeout: ML_TIMEOUT,
    });

    if (healthCheck.status !== 200) {
      console.error("❌ ML service health check failed");
      throw new Error("ML service is not healthy");
    }

    console.log("✅ ML service health check passed");

    // Send data to Python ML API
    const response = await axios.post(`${ML_API_URL}/predict`, pharmacies, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: ML_TIMEOUT,
    });

    console.log("✅ ML scores received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error contacting ML model:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.error(
        "❌ ML service is not running. Please start the Python server first."
      );
      console.error("ℹ️  Run the following commands:");
      console.error("python venv\\pharmacy_api.py");
    }

    return [];
  }
};
