console.log("activated");

document.getElementById('predict-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
        age_years: formData.get('age_years'), 
        sex: formData.get('sex'),
        chest_pain: formData.get('chest_pain'),
        cholesterol: formData.get('cholesterol'),
        fasting_bs: formData.get('fasting_bs'),
        max_hr: formData.get('max_hr'),
        exercise_angina: formData.get('exercise_angina'),
        oldpeak: formData.get('oldpeak'),
        st_slope: formData.get('st_slope'),
        height: formData.get('height'),
        weight: formData.get('weight'),
        ap_hi: formData.get('ap_hi'),
        ap_lo: formData.get('ap_lo'),
        gluc: formData.get('gluc'),
        smoke: formData.get('smoke'),
        alco: formData.get('alco'),
        active: formData.get('active'),
        bmi: formData.get('bmi')
    };

    console.log(data);

    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        document.getElementById('hypertensionStage').textContent = `${responseData.hypertension_stage}`;
        // document.getElementById('cvdProbability').textContent = `Risk Probability: ${responseData.cvd_probability}%`;
        document.getElementById('cvdPrediction').textContent =`CVD Probability: ${responseData.cvd_prediction}`;
        document.getElementById('resultContainer').style.display = 'block';

        let resultContainer = document.getElementById("resultContainer");
        resultContainer.style.display = 'block'; 
    })
    .catch(error => {
        console.error('Error:', error);
    });
});