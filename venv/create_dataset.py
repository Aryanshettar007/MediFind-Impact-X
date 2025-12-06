import json
import random
from datetime import datetime, timedelta

def create_pharmacy_dataset(num_pharmacies=50):
    """
    Create a dataset of pharmacies with random data
    """
    pharmacies = []
    
    # Sample data for variety
    cities = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Kolkata", "Hyderabad", "Pune"]
    states = ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "West Bengal", "Telangana", "Maharashtra"]
    
    for i in range(num_pharmacies):
        pharmacy_id = f"P{str(i+1).zfill(3)}"
        name = f"Pharmacy_{i+1}"
        
        # Random data generation
        distance = round(random.uniform(0.5, 10.0), 2)  # 0.5 to 10 km
        price = random.randint(20, 100)  # 20 to 100 rupees
        stock = random.randint(10, 100)  # 10 to 100 units
        
        # Random expiry date between 6 months to 2 years from now
        days_from_now = random.randint(180, 730)
        expiry_date = (datetime.now() + timedelta(days=days_from_now)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        city = random.choice(cities)
        state = random.choice(states)
        
        pharmacy_data = {
            "pharmacy_id": pharmacy_id,
            "name": name,
            "distance_km": distance,
            "price": price,
            "stock": stock,
            "expiry_date": expiry_date,
            "city": city,
            "state": state
        }
        
        pharmacies.append(pharmacy_data)
    
    return pharmacies

def save_dataset(pharmacies, filename="pharmacy_dataset.json"):
    """
    Save the pharmacy dataset to a JSON file
    """
    with open(filename, 'w') as f:
        json.dump(pharmacies, f, indent=2)
    
    print(f"Dataset saved to {filename} with {len(pharmacies)} pharmacies")

def main():
    # Create dataset
    pharmacies = create_pharmacy_dataset(50)
    
    # Save to file
    save_dataset(pharmacies)
    
    # Print first few entries
    print("\nFirst 5 pharmacies in dataset:")
    for i, pharmacy in enumerate(pharmacies[:5]):
        print(f"{i+1}. {pharmacy}")

if __name__ == "__main__":
    main()