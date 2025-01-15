console.log("activated");

document.getElementById('predict-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const loadingScreen = document.getElementById('loadingScreen');
    const predictionOverlay = document.getElementById('predictionOverlay');

    loadingScreen.style.display = 'flex';

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    console.log("Form Data:", data);

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Response Data:", responseData);

        loadingScreen.style.display = 'none';

        document.body.classList.add('blur-background');
        predictionOverlay.style.display = 'block';
        document.getElementById('cvdResult').textContent = `CVD Prediction: ${responseData.cvd_prediction}`;
        document.getElementById('hypertensionResult').textContent = `Hypertension Stage: ${responseData.hypertension_stage}`;

    } catch (error) {
        console.error("Error:", error);
        loadingScreen.style.display = 'none';
        alert("An error occurred. Please try again.");

        document.getElementById('cvdResult').textContent = "Error: Unable to fetch prediction.";
        document.getElementById('hypertensionResult').textContent = "";
        predictionOverlay.style.display = 'block';
    }
});

function closePrediction() {
    document.getElementById('predictionOverlay').style.display = 'none';
    document.body.classList.remove('blur-background');
}