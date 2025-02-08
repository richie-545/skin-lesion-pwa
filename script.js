let model;
const modelURL = "https://teachablemachine.withgoogle.com/models/kcjx_7PYU/";

async function loadModel() {
    console.log("Loading model...");
    model = await tmImage.load(modelURL + "model.json", modelURL + "metadata.json");
    console.log("Model loaded successfully.", model.getClassLabels());

    // Enable file input after model loads
    document.getElementById("fileInput").disabled = false;
}

// Disable file input until model is ready
document.getElementById("fileInput").disabled = true;

// Load model when page loads
window.onload = async () => {
    await loadModel();
};

document.getElementById("fileInput").addEventListener("change", function (event) {
    if (!model) {
        console.error("Model not loaded yet!");
        return;
    }

    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                document.getElementById("result").innerHTML = `<img src="${img.src}" width="250"><br>`;
                predict(img);
            };
        };
        reader.readAsDataURL(file);
    }
});

async function predict(imageElement) {
    if (!model) {
        console.error("Model not loaded yet!");
        return;
    }

    const prediction = await model.predict(imageElement);
    
    // Find the class with the highest probability
    let highestProbability = 0;
    let bestClass = "";

    for (let i = 0; i < prediction.length; i++) {
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }

    console.log("Predictions:", prediction);
    
    // Display the best prediction
    document.getElementById("result").innerHTML += `<p>Prediction: <strong>${bestClass}</strong> - Confidence: ${Math.round(highestProbability * 100)}%</p>`;
}
