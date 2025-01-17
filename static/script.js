console.log("activated");

// Step-by-Step Wizard Logic
const formSteps = document.querySelectorAll('.form-step');
const progressBar = document.getElementById('progress');
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');
let currentStep = 0;

// Show the first step initially
showStep(currentStep);

// Next button functionality
nextButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (currentStep < formSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
            updateProgressBar();
        }
    });
});

// Previous button functionality
prevButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
            updateProgressBar();
        }
    });
});

// Function to show the current step
function showStep(stepIndex) {
    formSteps.forEach((step, index) => {
        step.classList.toggle('active', index === stepIndex);
    });
}

// Function to update the progress bar
function updateProgressBar() {
    const totalSteps = formSteps.length;
    const baseProgress = 10; // Start with 10% progress
    const stepProgress = ((currentStep + 1) / totalSteps) * 90; // Remaining 90% divided by steps
    const progress = baseProgress + stepProgress; // Total progress
    progressBar.style.width = `${progress}%`;
}

// Form Submission and Loading Animation Logic
document.getElementById('predict-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const loadingScreen = document.getElementById('loadingScreen');
    const predictionOverlay = document.getElementById('predictionOverlay');
    const predictionBackdrop = document.getElementById('predictionBackdrop');

    // Show loading screen
    loadingScreen.style.display = 'flex';

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    console.log("Form Data:", data);

    try {
        await new Promise(resolve => setTimeout(resolve, 2750));

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
        predictionBackdrop.style.display = 'block';
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

// Function to close the prediction overlay
function closePrediction() {
    document.getElementById('predictionOverlay').style.display = 'none';
    document.getElementById('predictionBackdrop').style.display = 'none';
}