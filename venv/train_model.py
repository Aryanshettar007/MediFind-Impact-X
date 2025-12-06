import json
import pickle
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

def create_ml_model(pharmacies):
   
    # Extract features
    distances = np.array([p['distance_km'] for p in pharmacies]).reshape(-1, 1)
    prices = np.array([p['price'] for p in pharmacies]).reshape(-1, 1)
    stocks = np.array([p['stock'] for p in pharmacies]).reshape(-1, 1)
    
    # Combine features
    X = np.column_stack([distances, prices, stocks])
    
    # Create target scores based on your business rules
    # Normalize features for target calculation
    def normalize_for_target(values, reverse=False):
        min_val = np.min(values)
        max_val = np.max(values)
        if min_val == max_val:
            return np.ones_like(values)
        if reverse:
            return (max_val - values) / (max_val - min_val)
        else:
            return (values - min_val) / (max_val - min_val)
    
    # Calculate target scores using your weights
    norm_distances = normalize_for_target(distances, reverse=True)  # Lower distance = better
    norm_prices = normalize_for_target(prices, reverse=True)       # Lower price = better
    norm_stocks = normalize_for_target(stocks, reverse=False)      # Higher stock = better
    
    # Apply your weights to create target variable
    y = (norm_distances * 0.70 + norm_prices * 0.20 + norm_stocks * 0.10).flatten()
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train linear regression model
    model = LinearRegression()
    model.fit(X_scaled, y)
    
    # Create model package
    ml_model = {
        'model': model,
        'scaler': scaler,
        'feature_means': scaler.mean_.tolist(),
        'feature_stds': scaler.scale_.tolist(),
        'feature_names': ['distance_km', 'price', 'stock']
    }
    
    return ml_model

def predict_scores(pharmacies, ml_model):
    """
    Use the trained ML model to predict scores
    """
    # Extract features
    features = []
    pharmacy_ids = []
    
    for pharmacy in pharmacies:
        features.append([
            pharmacy['distance_km'],
            pharmacy['price'], 
            pharmacy['stock']
        ])
        pharmacy_ids.append(pharmacy['pharmacy_id'])
    
    # Convert to numpy array
    X = np.array(features)
    
    # Scale features using the trained scaler
    X_scaled = (X - ml_model['feature_means']) / ml_model['feature_stds']
    
    # Predict scores
    scores = ml_model['model'].predict(X_scaled)
    
    # Combine with pharmacy IDs
    results = list(zip(pharmacy_ids, scores))
    
    return results

def save_ml_model(ml_model, filename="pharmacy_ml_model.pkl"):
    """
    Save the trained ML model to a pickle file
    """
    with open(filename, 'wb') as f:
        pickle.dump(ml_model, f)
    
    print(f"ML Model saved to {filename}")

def load_ml_model(filename="pharmacy_ml_model.pkl"):
    """
    Load the trained ML model from a pickle file
    """
    with open(filename, 'rb') as f:
        ml_model = pickle.load(f)
    
    return ml_model

def main():
    # Load the dataset
    try:
        with open('pharmacy_dataset.json', 'r') as f:
            pharmacies = json.load(f)
    except FileNotFoundError:
        print("Please run create_dataset.py first to create the dataset")
        return
    
    print(f"Loaded {len(pharmacies)} pharmacies")
    
    # Train the ML model
    print("Training ML model...")
    ml_model = create_ml_model(pharmacies)
    
    # Save the model
    save_ml_model(ml_model)
    
    # Test the model
    print("\nTesting the ML model with first 10 pharmacies:")
    results = predict_scores(pharmacies[:10], ml_model)
    
    # Sort by score
    sorted_results = sorted(results, key=lambda x: x[1], reverse=True)
    
    print("\nTop 5 ranked pharmacies (ML Model):")
    for i, (pharmacy_id, score) in enumerate(sorted_results[:5]):
        pharmacy = next(p for p in pharmacies[:10] if p['pharmacy_id'] == pharmacy_id)
        print(f"{i+1}. ID: {pharmacy_id}, "
              f"Distance: {pharmacy['distance_km']}km, "
              f"Price: ₹{pharmacy['price']}, "
              f"Stock: {pharmacy['stock']}, "
              f"Score: {score:.4f}")
    
    # Show model coefficients
    print(f"\nModel Coefficients: {ml_model['model'].coef_}")
    print(f"Model Intercept: {ml_model['model'].intercept_:.4f}")

if __name__ == "__main__":
    main()