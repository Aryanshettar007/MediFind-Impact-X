import os
import logging
import sys
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging to show in console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variable to store the ML model
ml_model = None

def load_ml_model(model_path="pharmacy_ml_model.pkl"):
    """
    Load the trained ML model from pickle file
    """
    global ml_model
    try:
        with open(model_path, 'rb') as f:
            ml_model = pickle.load(f)
        logger.info("✅ ML Model loaded successfully")
        logger.info(f"Model type: {type(ml_model['model']).__name__}")
        logger.info(f"Feature names: {ml_model['feature_names']}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load ML model: {e}")
        return False

def predict_ml_scores(pharmacies, ml_model):
    """
    Use the trained ML model to predict scores
    """
    try:
        # Extract features
        features = []
        pharmacy_data = []
        
        for pharmacy in pharmacies:
            features.append([
                pharmacy['distance_km'],
                pharmacy['price'], 
                pharmacy['stock']
            ])
            pharmacy_data.append(pharmacy)
        
        # Convert to numpy array
        X = np.array(features)
        
        # Scale features using the trained scaler
        X_scaled = (X - ml_model['feature_means']) / ml_model['feature_stds']
        
        # Predict scores using ML model
        scores = ml_model['model'].predict(X_scaled)
        
        # Combine results
        results = []
        for i, pharmacy in enumerate(pharmacy_data):
            results.append({
                "pharmacy_id": pharmacy['pharmacy_id'],
                "ai_score": round(float(scores[i]), 4)
            })
        
        return results
        
    except Exception as e:
        logger.error(f"Error in ML prediction: {e}")
        return []

@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    status = "healthy" if ml_model is not None else "model not loaded"
    return jsonify({
        "status": status,
        "message": "ML API is running",
        "model_loaded": ml_model is not None,
        "model_type": "LinearRegression" if ml_model else "None"
    })

@app.route('/predict', methods=['POST'])
def predict_scores():
    """
    Predict AI scores for pharmacies using the trained ML model
    """
    try:
        # Check if model is loaded
        if ml_model is None:
            return jsonify({
                "error": "ML Model not loaded. Please check if pharmacy_ml_model.pkl exists",
                "status": "error"
            }), 500
        
        # Get JSON data from request
        pharmacies = request.get_json()
        
        # Log the incoming request
        logger.info(f"Received prediction request for {len(pharmacies) if isinstance(pharmacies, list) else 'unknown'} pharmacies")
        
        # Validate input is a list
        if not isinstance(pharmacies, list):
            return jsonify({
                "error": "Input must be an array of pharmacies",
                "status": "error"
            }), 400
        
        # Validate each pharmacy has required fields
        valid_pharmacies = []
        for pharmacy in pharmacies:
            try:
                required_fields = ['pharmacy_id', 'distance_km', 'price', 'stock']
                if all(field in pharmacy for field in required_fields):
                    # Validate data types
                    distance_km = float(pharmacy['distance_km'])
                    price = float(pharmacy['price'])
                    stock = int(pharmacy['stock'])
                    valid_pharmacies.append(pharmacy)
                else:
                    logger.warning(f"Missing required fields in pharmacy {pharmacy.get('pharmacy_id', 'Unknown')}")
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid data types for pharmacy {pharmacy.get('pharmacy_id', 'Unknown')}: {e}")
                continue
        
        if not valid_pharmacies:
            return jsonify({
                "error": "No valid pharmacies found in request",
                "status": "error"
            }), 400
        
        # Predict scores using ML model
        results = predict_ml_scores(valid_pharmacies, ml_model)
        
        logger.info(f"Successfully processed {len(results)} pharmacies using ML model")
        
        return jsonify(results)
    
    except Exception as e:
        logger.error(f"Error processing prediction request: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e),
            "status": "error"
        }), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """
    Get information about the loaded ML model
    """
    if ml_model is None:
        return jsonify({
            "error": "ML Model not loaded",
            "status": "error"
        }), 500
    
    return jsonify({
        "model_type": type(ml_model['model']).__name__,
        "feature_names": ml_model['feature_names'],
        "coefficients": ml_model['model'].coef_.tolist(),
        "intercept": float(ml_model['model'].intercept_),
        "status": "loaded"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "status": "error"
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "error": "Method not allowed",
        "status": "error"
    }), 405

if __name__ == '__main__':
    try:
        # Load the ML model when starting the server
        model_loaded = load_ml_model()
        
        if not model_loaded:
            logger.error("❌ Failed to load ML model. Please run train_model.py first")
            sys.exit(1)
        
        port = int(os.environ.get("PORT", 5001))
        logger.info(f"🚀 Starting ML API on http://0.0.0.0:{port}")
        logger.info(f"🤖 Using model: {type(ml_model['model']).__name__}")
        app.run(host="0.0.0.0", port=port, debug=False)
        
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)