import { useState } from "react";
import MapView from "./MapView";
import API_URL from "../config";
import { Pharmacy, UserLocation } from "../types";
import {
  Search,
  TrendingUp,
  Pill,
  Upload,
  Loader2,
  MapPin,
  Filter,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./LoadingSpinner";
import { NoResults } from "./NoResults";

export function UserInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAlternates, setIsLoadingAlternates] = useState(false);
  const [alternates, setAlternates] = useState([]);
  const [sortOption, setSortOption] = useState("ai_score");

  // 🔍 Main search logic
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a medicine name");
      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    setShowResults(false);
    setAlternates([]);

    try {
      if (!navigator.geolocation) {
        alert("Geolocation not supported on this browser");
        setIsSearching(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          console.log("📍 User location:", latitude, longitude);

          const res = await fetch(`${API_URL}/api/search_medicine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              medicine_name: searchQuery,
              latitude,
              longitude,
            }),
          });

          const data = await res.json();
          console.log("✅ Search Results:", data);

          if (data && Array.isArray(data.pharmacies) && data.pharmacies.length > 0) {
            const formatted: Pharmacy[] = data.pharmacies.map((p: any) => ({
              ...p,
              lat: p.coordinates ? p.coordinates[1] : undefined,
              lng: p.coordinates ? p.coordinates[0] : undefined,
              inStock: p.stock > 0,
              address: `${p.city}, ${p.state}`,
            }));

            setPharmacies(formatted);
            setUserLocation({ lat: latitude, lng: longitude });
            setShowResults(true);
          } else {
            alert("No nearby pharmacies found!");
            setPharmacies([]);
            setShowResults(false);
          }

          setIsSearching(false);
          setHasSearched(true);

          // 🧠 Automatically get AI-based substitutes
          handleGetAlternates(searchQuery);
        },
        (err) => {
          console.error("❌ Location access denied:", err);
          alert("Unable to detect your location. Please allow location access.");
          setIsSearching(false);
        },
        { enableHighAccuracy: true }
      );
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      alert("Unexpected error. Please try again.");
      setIsSearching(false);
    }
  };

  // 🧠 Fetch AI-based alternate medicines
  const handleGetAlternates = async (query: string) => {
    if (!query) return;
    setIsLoadingAlternates(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicine_name: query }),
      });

      const data = await res.json();
      console.log("🤖 Gemini AI Response:", data);

      if (data.alternatives && data.alternatives.length > 0) {
        const cleaned = data.alternatives
          .map((a: string) =>
            a
              .replace(/[`"']/g, "")
              .replace(/json/gi, "")
              .replace(/\{|\}|\[|\]/g, "")
              .trim()
          )
          .filter((a: string) => a.length > 0);
        setAlternates(cleaned);
      } else {
        setAlternates([]);
      }
    } catch (err) {
      console.error("❌ AI Suggestion Error:", err);
      setAlternates([]);
    } finally {
      setIsLoadingAlternates(false);
    }
  };

  // 📸 OCR Upload (Prescription)
  const handleUploadPrescription = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      setIsUploading(true);

      try {
        const res = await fetch(`${API_URL}/api/ocr/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const extractedText = data.text;
        if (extractedText && extractedText.trim()) {
          setSearchQuery(extractedText.trim().split("\n")[0]); // Use the first line as the query
          alert(`🧠 Detected text. Searching for: ${extractedText.trim().split("\n")[0]}`);
        } else {
          alert("No recognizable text found in the prescription.");
        }
      } catch (err) {
        console.error("❌ OCR upload failed:", err);
        alert("Error while reading prescription.");
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  // 🧮 Sorting logic
  const sortPharmacies = (option: string) => {
    let sorted = [...pharmacies];

    if (option === "price") sorted.sort((a, b) => a.price - b.price);
    else if (option === "stock") sorted.sort((a, b) => b.stock - a.stock);
    else if (option === "distance") sorted.sort((a, b) => a.distance_km - b.distance_km);
    else if (option === "ai_score") sorted.sort((a, b) => b.ai_score - a.ai_score);

    setPharmacies(sorted);
    setSortOption(option);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-emerald-100 dark:border-gray-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              MediFind
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8 border-emerald-200 dark:border-gray-800 shadow-lg bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Enter medicine name (or upload prescription)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-12 border-emerald-200 dark:border-gray-700 focus:border-emerald-500 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
              >
                {isSearching ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Search className="h-5 w-5 mr-2" />}
                Search
              </Button>

              <Button
                onClick={handleUploadPrescription}
                disabled={isUploading}
                variant="outline"
                className="h-12 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                {isUploading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Upload className="h-5 w-5 mr-2" />}
                {isUploading ? "Processing..." : "Upload Prescription"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isSearching && <LoadingSpinner />}

        {showResults && hasSearched && !isSearching && (
          <>
            {userLocation && pharmacies.length > 0 && <MapView userLocation={userLocation} pharmacies={pharmacies} />}

            {/* 🧮 Available Pharmacies Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5" /> Available Pharmacies
                </h3>

                {/* ✅ Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  <select
                    value={sortOption}
                    onChange={(e) => sortPharmacies(e.target.value)}
                    className="border border-emerald-300 dark:border-gray-700 rounded-md p-2 text-sm focus:ring-emerald-500 bg-white dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="ai_score">AI Score (Default)</option>
                    <option value="price">Price</option>
                    <option value="stock">Availability</option>
                    <option value="distance">Distance</option>
                  </select>
                </div>
              </div>

              {/* Pharmacy Cards */}
              <div className="space-y-3">
                {pharmacies.map((pharmacy, i) => (
                  <Card
                    key={i}
                    className="border border-emerald-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800"
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-lg dark:text-gray-100">{pharmacy.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pharmacy.address}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{pharmacy.distance_km.toFixed(2)} km away</p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-xl text-emerald-600 font-semibold">₹{pharmacy.price}</div>
                        {pharmacy.inStock ? (
                          <Badge className="bg-emerald-100 text-emerald-700">In Stock</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>
                        )}

                        {/* 🗺️ Directions */}
                        {pharmacy.coordinates && pharmacy.coordinates.length === 2 && userLocation && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => {
                              const [lng, lat] = pharmacy.coordinates;
                              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}`;
                              window.open(mapsUrl, "_blank");
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-1" /> Directions
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 🧠 Substitute Suggestions */}
            <Card className="mt-10 border-emerald-200 dark:border-gray-800 shadow-lg dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Pill className="h-5 w-5" />
                  Substitute Suggestions
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  AI-generated alternatives with similar composition
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAlternates ? (
                  <div className="text-center py-6 text-gray-500">
                    Loading alternatives...
                  </div>
                ) : alternates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {alternates.map((alt, i) => (
                      <Card
                        key={i}
                        className="border-emerald-200 dark:border-gray-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all"
                      >
                        <CardContent className="p-4 flex flex-col items-start justify-between h-full">
                          <Badge className="mb-3 bg-teal-100 text-teal-700 border-0 dark:bg-teal-900/30 dark:text-teal-300">
                            Substitute
                          </Badge>
                          <h4 className="text-gray-900 dark:text-gray-100 font-semibold mb-2">{alt}</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-auto border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => {
                              setSearchQuery(alt);
                              handleSearch();
                            }}
                          >
                            Search
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    No AI suggestions available
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!showResults && hasSearched && !isSearching && <NoResults />}
      </div>

      <footer className="bg-white/80 dark:bg-gray-900/90 border-t border-emerald-100 dark:border-gray-800 mt-16 py-6 text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
        Powered by{" "}
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Impact-X</span> ⚡
      </footer>
    </div>
  );
}
