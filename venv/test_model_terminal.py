import pickle
import numpy as np

def load_model(model_path="pharmacy_ml_model.pkl"):
    """Load the trained ML model"""
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print("✅ Model loaded successfully!")
        return model
    except FileNotFoundError:
        print("❌ Model file not found. Please run train_model.py first.")
        return None

def predict_single_pharmacy(model):
    """Predict score for a single pharmacy from terminal input"""
    print("\n" + "="*50)
    print("🏥 PHARMACY AI SCORE PREDICTOR")
    print("="*50)
    
    print("\nEnter pharmacy details:")
    
    # Get input from user
    try:
        distance = float(input("Distance in km: "))
        price = float(input("Price in ₹: "))
        stock = int(input("Stock quantity: "))
    except ValueError:
        print("❌ Please enter valid numbers!")
        return
    
    # Prepare features
    features = np.array([[distance, price, stock]])
    
    # Scale features
    X_scaled = (features - model['feature_means']) / model['feature_stds']
    
    # Predict score
    score = model['model'].predict(X_scaled)[0]
    
    # Display results
    print("\n" + "="*40)
    print("📊 PREDICTION RESULTS")
    print("="*40)
    print(f"Distance: {distance} km")
    print(f"Price: ₹{price}")
    print(f"Stock: {stock} units")
    print(f"🤖 AI Score: {score:.4f}")
    print("="*40)
    
    # Interpretation
    if score > 0.8:
        print("🎉 Excellent choice! This pharmacy scores very high.")
    elif score > 0.6:
        print("👍 Good choice! This pharmacy scores well.")
    elif score > 0.4:
        print("⚠️  Average choice. Consider other options.")
    else:
        print("❌ Poor choice. Look for better alternatives.")

def compare_pharmacies(model):
    """Compare multiple pharmacies"""
    print("\n" + "="*50)
    print("🔍 COMPARE MULTIPLE PHARMACIES")
    print("="*50)
    
    pharmacies = []
    
    while True:
        print(f"\n--- Pharmacy {len(pharmacies) + 1} ---")
        try:
            name = input("Pharmacy name (or 'done' to finish): ").strip()
            if name.lower() == 'done':
                break
                
            distance = float(input("Distance in km: "))
            price = float(input("Price in ₹: "))
            stock = int(input("Stock quantity: "))
            
            pharmacies.append({
                'name': name,
                'distance': distance,
                'price': price,
                'stock': stock
            })
            
        except ValueError:
            print("❌ Please enter valid numbers!")
            continue
    
    if not pharmacies:
        print("❌ No pharmacies to compare.")
        return
    
    # Predict scores for all pharmacies
    print("\n" + "="*60)
    print("📊 COMPARISON RESULTS")
    print("="*60)
    
    results = []
    for pharmacy in pharmacies:
        features = np.array([[pharmacy['distance'], pharmacy['price'], pharmacy['stock']]])
        X_scaled = (features - model['feature_means']) / model['feature_stds']
        score = model['model'].predict(X_scaled)[0]
        results.append((pharmacy, score))
    
    # Sort by score (descending)
    results.sort(key=lambda x: x[1], reverse=True)
    
    print(f"\n{'Rank':<4} {'Pharmacy':<15} {'Distance':<8} {'Price':<6} {'Stock':<6} {'AI Score':<8}")
    print("-" * 60)
    
    for rank, (pharmacy, score) in enumerate(results, 1):
        print(f"{rank:<4} {pharmacy['name'][:14]:<15} "
              f"{pharmacy['distance']:<8.2f} ₹{pharmacy['price']:<5} {pharmacy['stock']:<6} "
              f"{score:<8.4f}")
    
    # Show best choice
    best_pharmacy, best_score = results[0]
    print(f"\n🏆 BEST CHOICE: {best_pharmacy['name']}")
    print(f"   Score: {best_score:.4f}")

def show_model_info(model):
    """Show information about the loaded model"""
    print("\n" + "="*40)
    print("🤖 MODEL INFORMATION")
    print("="*40)
    print(f"Model Type: {type(model['model']).__name__}")
    print(f"Features: {model['feature_names']}")
    print(f"Coefficients: {model['model'].coef_}")
    print(f"Intercept: {model['model'].intercept_:.4f}")
    print(f"Feature Means: {model['feature_means']}")
    print(f"Feature Stds: {model['feature_stds']}")

def main():
    """Main function"""
    # Load the model
    model = load_model()
    if model is None:
        return
    
    while True:
        print("\n" + "="*50)
        print("🏥 PHARMACY AI SCORING SYSTEM")
        print("="*50)
        print("1. Score a single pharmacy")
        print("2. Compare multiple pharmacies")
        print("3. Show model information")
        print("4. Exit")
        
        choice = input("\nChoose an option (1-4): ").strip()
        
        if choice == '1':
            predict_single_pharmacy(model)
        elif choice == '2':
            compare_pharmacies(model)
        elif choice == '3':
            show_model_info(model)
        elif choice == '4':
            print("👋 Thank you for using the Pharmacy AI Scoring System!")
            break
        else:
            print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()