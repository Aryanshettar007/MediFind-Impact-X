import { GoogleMap, Marker, InfoWindow, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useState, useRef, useEffect } from "react";
import { MapViewProps, Pharmacy } from "../types";

const containerStyle = { width: "100%", height: "500px" };

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function MapView({ userLocation, pharmacies }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [center, setCenter] = useState(userLocation);
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
      mapRef.current?.panTo(userLocation);
    }
  }, [userLocation]);

  const getDirections = (pharmacy: Pharmacy) => {
    if (!userLocation || !pharmacy.lat || !pharmacy.lng) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: pharmacy.lat, lng: pharmacy.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) setDirections(result);
        else console.error("Directions request failed:", status);
      }
    );
  };

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      onLoad={onLoad}
      mapContainerStyle={containerStyle}
      center={center || { lat: 12.9716, lng: 77.5946 }}
      zoom={center ? 13 : 6}
    >
      {/* User Marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
        />
      )}

      {/* Pharmacy Markers */}
      {pharmacies.map((p, i) => (
        p.lat && p.lng ? (
          <Marker
            key={i}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => setSelected(p)}
            icon={{
              url:
                p.ai_score && p.ai_score >= 0.5
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        ) : null
      ))}

      {/* Info Window */}
      {selected && (
        <InfoWindow
          position={{ lat: selected.lat!, lng: selected.lng! }}
          onCloseClick={() => setSelected(null)}
        >
          <div>
            <h3>{selected.name}</h3>
            <p>💰 ₹{selected.price.toFixed(2)}</p>
            <p>📍 {selected.distance_km} km away</p>
            <button
              onClick={() => getDirections(selected)}
              style={{
                backgroundColor: "#0f766e",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "5px 8px",
                cursor: "pointer",
              }}
            >
              Get Directions
            </button>
          </div>
        </InfoWindow>
      )}

      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
