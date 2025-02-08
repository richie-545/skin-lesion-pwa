let model;
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/kcjx_7PYU/"; // Replace with your actual Teachable Machine model URL

async function loadModel() {
    model = await tf.loadLayersModel(MODEL_URL);
    console.log("Model Loaded Successfully!");
}

document.getElementById("imageUpload").addEventListener("change", async function (event) {
    let file = event.target.files[0];
    let img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    img.onload = async function () {
        let tensor = tf.browser.fromPixels(img)
            .resizeNearestNeighbor([224, 224]) // Resize to match model input size
            .expandDims()
            .toFloat()
            .div(255);
        
        let prediction = await model.predict(tensor).data();
        
        let resultText = prediction[0] > 0.5 ? "Malignant (Melanoma)" : "Benign";
        document.getElementById("result").innerHTML = `<h2>Prediction: ${resultText}</h2>`;
    }
});

loadModel();
