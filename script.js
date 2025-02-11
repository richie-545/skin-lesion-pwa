let model;
const modelURL = "https://teachablemachine.withgoogle.com/models/kcjx_7PYU/";

// Show a loading spinner with a message
function showSpinner(message) {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = "block";
    spinner.innerText = message;
  }
}

// Hide the loading spinner
function hideSpinner() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = "none";
    spinner.innerText = "";
  }
}

async function loadModel() {
  try {
    console.log("Loading model...");
    model = await tmImage.load(modelURL + "model.json", modelURL + "metadata.json");
    console.log("Model loaded successfully.", model.getClassLabels());
    document.getElementById("fileInput").disabled = false;
    hideSpinner();
  } catch (error) {
    console.error("Error loading model:", error);
    document.getElementById("result").innerHTML =
      "<p style='color:red;'>Error loading AI model. Check console for details.</p>";
    hideSpinner();
  }
}

// Disable file input initially
document.getElementById("fileInput").disabled = true;

// Load model when the page loads
window.onload = async () => {
  showSpinner("Loading model...");
  await loadModel();
};

// File input change event for uploading image
document.getElementById("fileInput").addEventListener("change", function (event) {
  if (!model) {
    console.error("Model not loaded yet!");
    return;
  }
  showSpinner("Processing image...");
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        document.getElementById("uploadedImage").src = img.src;
        document.getElementById("uploadedImage").style.display = "block";
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
  try {
    const prediction = await model.predict(imageElement);
    let highestProbability = 0;
    let bestClass = "";
    for (let i = 0; i < prediction.length; i++) {
      if (prediction[i].probability > highestProbability) {
        highestProbability = prediction[i].probability;
        bestClass = prediction[i].className;
      }
    }
    console.log("Predictions:", prediction);
    // Add a tooltip info icon next to the prediction
    document.getElementById("prediction").innerHTML =
      `<strong>Prediction:</strong> ${bestClass} <span class="tooltip" title="This prediction is based on the model's analysis of the image.">ℹ️</span>`;
    document.getElementById("confidence").innerHTML =
      `<strong>Confidence:</strong> ${Math.round(highestProbability * 100)}%`;
    hideSpinner();
  } catch (error) {
    console.error("Error in prediction:", error);
    document.getElementById("result").innerHTML += "<p style='color:red;'>Error in prediction.</p>";
    hideSpinner();
  }
}

// Drag and Drop functionality for the upload box
const uploadBox = document.querySelector(".upload-box");
uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});
uploadBox.addEventListener("dragleave", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
});
uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 0) {
    document.getElementById("fileInput").files = files;
    // Manually trigger change event
    const event = new Event("change");
    document.getElementById("fileInput").dispatchEvent(event);
  }
});

// Dark/Light mode toggle
const modeToggle = document.getElementById("mode-toggle");
if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
}

// Social sharing using the Web Share API if available
const shareBtn = document.getElementById("share-btn");
if (shareBtn) {
  shareBtn.addEventListener("click", () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Skin Lesion Detector Result",
          text: `Prediction: ${document.getElementById("prediction").innerText}\nConfidence: ${document.getElementById("confidence").innerText}`,
          url: window.location.href,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      alert("Sharing not supported on this browser.");
    }
  });
}

// Download result as a text file
const downloadBtn = document.getElementById("download-btn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    const predictionText = document.getElementById("prediction").innerText;
    const confidenceText = document.getElementById("confidence").innerText;
    const content = `Skin Lesion Detector Result:\n${predictionText}\n${confidenceText}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "result.txt";
    link.click();
  });
}
