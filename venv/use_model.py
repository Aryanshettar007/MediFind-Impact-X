import json
import pickle

def load_model(filename="pharmacy_ranking_model.pkl"):
    """
    Load the trained model from a pickle file
    """
    with open(filename, 'rb') as f:
        model = pickle.load(f)
    
    return model

def predict_ranking(pharmacies, model):
    """
    Use the trained model to rank pharmacies
    """
    def normalize_value(value, min_val, max_val, reverse=False):
        if min_val == max_val:
            return 1.0
        if reverse:
            return (max_val - value) / (max_val - min_val)
        else:
            return (value - min_val) / (max_val - min_val)
    
    scores = []
    for pharmacy in pharmacies:
        # Normalize each feature using stored ranges
        norm_distance = normalize_value(
            pharmacy['distance_km'], 
            model['feature_ranges']['distance']['min'],
            model['feature_ranges']['distance']['max'],
            reverse=True
        )
        
        norm_price = normalize_value(
            pharmacy['price'],
            model['feature_ranges']['price']['min'],
            model['feature_ranges']['price']['max'],
            reverse=True
        )
        
        norm_stock = normalize_value(
            pharmacy['stock'],
            model['feature_ranges']['stock']['min'],
            model['feature_ranges']['stock']['max'],
            reverse=False
        )
        
        # Calculate weighted score
        score = (norm_distance * model['weights']['distance'] + 
                norm_price * model['weights']['price'] + 
                norm_stock * model['weights']['stock'])
        
        scores.append(score)
    
    # Sort pharmacies by score
    pharmacy_scores = list(zip(pharmacies, scores))
    sorted_pharmacies = sorted(pharmacy_scores, key=lambda x: x[1], reverse=True)
    
    return sorted_pharmacies

def main():
    # Load the trained model
    try:
        model = load_model()
        print("Model loaded successfully!")
    except FileNotFoundError:
        print("Please run train_model.py first to train and save the model")
        return
    
    # Load the dataset
    try:
        with open('pharmacy_dataset.json', 'r') as f:
            all_pharmacies = json.load(f)
    except FileNotFoundError:
        print("Please run create_dataset.py first to create the dataset")
        return
    
    # Example: Get ranking for specific pharmacies
    sample_pharmacies = [
        {
            "pharmacy_id": "P002",
            "name": "Medico Plus", 
            "distance_km": 10,
            "price": 30,
            "stock": 70,
            "expiry_date": "2026-02-20T00:00:00.000Z",
            "city": "Bangalore",
            "state": "Karnataka"
        },
        {
            "pharmacy_id": "P001",
            "name": "Health Mart",
            "distance_km": 2,
            "price": 35,
            "stock": 50,
            "expiry_date": "2025-12-15T00:00:00.000Z", 
            "city": "Bangalore",
            "state": "Karnataka"
        },
        {
            "pharmacy_id": "P003",
            "name": "Quick Meds",
            "distance_km": 5,
            "price": 25,
            "stock": 30,
            "expiry_date": "2026-05-10T00:00:00.000Z",
            "city": "Bangalore", 
            "state": "Karnataka"
        }
    ]
    
    # Get rankings
    ranked_pharmacies = predict_ranking(sample_pharmacies, model)
    
    print("\nRanked Pharmacies (Best to Worst):")
    print("=" * 80)
    for i, (pharmacy, score) in enumerate(ranked_pharmacies):
        print(f"{i+1}. {pharmacy['name']} (ID: {pharmacy['pharmacy_id']})")
        print(f"   Distance: {pharmacy['distance_km']}km | "
              f"Price: ₹{pharmacy['price']} | "
              f"Stock: {pharmacy['stock']} units")
        print(f"   Score: {score:.4f}")
        print()

if __name__ == "__main__":
    main()