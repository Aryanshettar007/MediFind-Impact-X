# 🧠 AI-Powered Smart Medicine Locator and Price Optimizer  
### Team: Impact-X | Team ID: 2  
### AXIOM-2025 SJBIT 24hour Hackathon 
Live-link : https://medi-find-impact-x.vercel.app/
---

## 📌 Problem Statement  
In many cities, patients struggle to find specific medicines — especially rare or emergency drugs — across nearby pharmacies. Prices for the same medicine vary widely between stores, and online alternatives are often slow during urgent needs.  
Our solution provides an **AI-powered, location-aware platform** that instantly identifies nearby pharmacies, compares real-time prices, and recommends the best option.

---

## 🎯 Objective  
- Identify medicines through **text or image (OCR)**.  
- Locate nearby pharmacies with **real-time stock and price**.  
- Rank pharmacies using an **AI-driven scoring model** based on price, distance, and stock.  
- Suggest **substitute medicines** using Gemini API.  
- Visualize results on an **interactive Google Maps interface**.  

---

## ⚙️ Tech Stack  

**Frontend:** React + TypeScript + Tailwind CSS  
**Backend:** Node.js + Express.js  
**Database:** MongoDB Atlas  
**Machine Learning:** Random Forest Regressor (Price-Distance-Stock scoring)  
**APIs & Integrations:**  
- Google Maps API (Geolocation, Distance Matrix)  
- Tesseract.js / Google Vision API (OCR for prescription images)  
- Gemini API (AI-based substitute recommendations)  

---

## 🔄 System Workflow  

1️⃣ User searches for a medicine or uploads a prescription.  
2️⃣ OCR extracts the medicine name.  
3️⃣ System detects the user's live location using Google Maps API.  
4️⃣ Backend fetches nearby pharmacies from MongoDB with price, stock, and expiry.  
5️⃣ ML model calculates an **AI score** and ranks results.  
6️⃣ Frontend displays pharmacies on map and list view with recommendations.  

---

## 🚀 Key Features  
- 📍 **Live location detection** using Google Maps API  
- 🧠 **AI-driven recommendation** (Random Forest scoring)  
- 🏪 **Pharmacy registration system** with stock, price, and expiry tracking  
- 🧾 **OCR-based medicine detection** from prescription uploads  
- 💊 **Substitute suggestion** using Gemini API  
- ⚡ **Fast, privacy-friendly, and real-time results**

---

