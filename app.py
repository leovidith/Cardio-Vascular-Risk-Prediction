from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import warnings
warnings.filterwarnings('ignore')
import os

app = Flask(__name__)

# Load the pickle files
base_dir = os.path.dirname(os.path.abspath(__file__))
try:
    model_path = os.path.join(base_dir, 'models', 'svm90.pkl')
    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    model_path = os.path.join(base_dir, 'models', 'standard_scaler.pkl')
    with open(model_path, 'rb') as f:
        scaler = pickle.load(f)

    model_path = os.path.join(base_dir, 'models', 'dtc.pkl')
    with open(model_path, 'rb') as f:
        dtc_model = pickle.load(f)

    model_path = os.path.join(base_dir, 'models', 'minmax.pkl')
    with open(model_path, 'rb') as f:
        hypertension_scaler = pickle.load(f)

except Exception as e:
    print(f"⭐ Error Loading Models: {e}")


hypertension_stages = {
    0: "Elevated",
    1: "Hypertension Stage 1",
    2: "Hypertension Stage 2",
    3: "Normal"
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # predict if the user has cvd or not
    try:
        data = request.get_json()

        required_fields = ['age_years', 'sex', 'chest_pain', 'cholesterol', 'fasting_bs', 'max_hr', 'exercise_angina', 'oldpeak', 'st_slope', 'height', 'weight', 'ap_hi', 'ap_lo', 'gluc', 'smoke', 'alco', 'active', 'bmi']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f"Missing fields: {', '.join(missing_fields)}"}), 400

        selected_features = np.array([
            int(data['age_years']),
            int(data['sex']),
            int(data['chest_pain']),
            float(data['cholesterol']),
            int(data['fasting_bs']),
            float(data['max_hr']),
            int(data['exercise_angina']),
            float(data['oldpeak']),
            int(data['st_slope'])
        ]).reshape(1, -1)

        scaled_features = scaler.transform(selected_features)
        model_prediction_prob = model.predict_proba(scaled_features)[0]
        model_prediction = model.predict(scaled_features)[0]
        flag = 0
        if model_prediction > 0.5:
            flag = 1
        else:
            flag = 0

        prob = model_prediction_prob[1]
        prob_scaled = round(prob * 100, 2)
        print(f"Raw Probability: {prob}\nScaled: {prob_scaled}")

        # use the prediction from cvd model and feed at as input for hypertension model
        hypertension_data = np.array([
                19741,
                int(data['sex']),
                float(data['height']),
                float(data['weight']),
                float(data['ap_hi']),
                float(data['ap_lo']),
                float(data['cholesterol']),
                int(data['gluc']),
                int(data['smoke']),
                int(data['alco']),
                int(data['active']),
                flag,
                int(data['age_years']),
                float(data['bmi'])  
            ]).reshape(1, -1)

        scaled_hypertension_features = hypertension_scaler.transform(hypertension_data)
        hypertension_stage_encoded = dtc_model.predict(scaled_hypertension_features)[0]

        hypertension_stage = hypertension_stages.get(hypertension_stage_encoded, "Unknown")


        # instead of returning the probability which might be inaccurate, return the range of risk
        if hypertension_stage == "Hypertension Stage 1":
            cvd_prediction = "High Chances (20% - 50%)"
            prob_scaled += 30 
        elif hypertension_stage == "Hypertension Stage 2":
            cvd_prediction = "Very High Chances (50% +)"
            prob_scaled += 50 
        elif hypertension_stage == "Elevated":
            cvd_prediction = "Moderate Chances (10 - 20%)"
            prob_scaled += 10
        else: 
            cvd_prediction = "Normal Chances"

        print(f"Probability after Rule based system: {prob_scaled}")

        return jsonify({
            'cvd_prediction': cvd_prediction,
            'cvd_probability': prob_scaled,
            'hypertension_stage': hypertension_stage
        })
    
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)