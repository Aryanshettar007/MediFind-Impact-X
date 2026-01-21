import { findPharmaciesNearby } from "../utils/searchHelper.js";
import { getMLScores } from "../utils/mlHelper.js";

export const searchMedicine = async (req, res) => {
  try {
    const { medicine_name, latitude, longitude } = req.body;

    // Step 1️⃣: Fetch nearby pharmacies from DB
    const pharmacies = await findPharmaciesNearby(
      medicine_name,
      latitude,
      longitude
    );
    if (!pharmacies.length) {
      return res.status(200).json({ 
        message: "No pharmacies found nearby", 
        pharmacies: [] 
      });
    }

    // Step 2️⃣: Get AI scores from ML service
    const mlScores = await getMLScores(pharmacies);

    // Step 3️⃣: Merge scores back into pharmacy list
    const finalResults = pharmacies.map((p) => {
      const mlResult = mlScores.find((s) => s.pharmacy_id === p.pharmacy_id);
      return {
        ...p,
        ai_score: mlResult ? mlResult.ai_score : 0,
      };
    });

    // Step 4️⃣: Sort by AI score and send response
    finalResults.sort((a, b) => b.ai_score - a.ai_score);

    res.json({
      message: "Search completed successfully",
      medicine_name,
      total_results: finalResults.length,
      pharmacies: finalResults,
    });
  } catch (error) {
    console.error("Error in searchMedicine:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
