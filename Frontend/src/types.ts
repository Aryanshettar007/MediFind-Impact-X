export interface UserLocation {
    lat: number;
    lng: number;
}

export interface Pharmacy {
    _id?: string;
    name: string;
    street?: string;
    city: string;
    state: string;
    stock: number;
    price: number;
    coordinates: number[];
    distance_km: number;
    ai_score: number;
    // Derived properties
    lat?: number;
    lng?: number;
    inStock?: boolean;
    address?: string;
}

export interface MapViewProps {
    userLocation: UserLocation | null;
    pharmacies: Pharmacy[];
}
