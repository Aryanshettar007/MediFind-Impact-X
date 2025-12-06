import Pharmacy from "../models/pharma.model.js";
import Medicine from "../models/medicine.model.js";

export const findPharmaciesNearby = async (
  medicine_name,
  latitude,
  longitude
) => {
  try {
    // 1️⃣ Find all medicines that match the search term and are valid
    const medicines = await Medicine.find({
      medicine_name: { $regex: medicine_name, $options: "i" },
      stock: { $gt: 0 },
      expiry_date: { $gte: new Date() },
    });

    if (!medicines.length) return [];

    // 2️⃣ Extract pharmacy IDs
    const pharmacyIds = medicines.map((m) => m.pharmacy_id);

    // 3️⃣ Find nearby pharmacies that have those IDs
    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance_km",
          spherical: true,
          query: { pharmacy_id: { $in: pharmacyIds } },
          maxDistance: 20000, // 20 km radius
        },
      },
      {
        $project: {
          _id: 0,
          pharmacy_id: 1,
          name: 1,
          distance_km: 1,
          coordinates: "$location.coordinates", // ✅ Include pharmacy coordinates
          "address.city": 1,
          "address.state": 1,
        },
      },
    ]);

    // 4️⃣ Merge pharmacy + medicine data
    const results = pharmacies.map((pharma) => {
      const med = medicines.find((m) => m.pharmacy_id === pharma.pharmacy_id);
      return {
        pharmacy_id: pharma.pharmacy_id,
        name: pharma.name,
        distance_km: pharma.distance_km / 1000,
        price: med?.price || 0,
        stock: med?.stock || 0,
        expiry_date: med?.expiry_date,
        city: pharma.address.city,
        state: pharma.address.state,
        coordinates: pharma.coordinates || [], // ✅ Ensure coordinates are passed to frontend
      };
    });
    console.log("✅ Nearby pharmacy results:", results);

    return results;
  } catch (err) {
    console.error("Error in findPharmaciesNearby:", err);
    return [];
  }
};
