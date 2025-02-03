document.getElementById("upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const totalPixels = pixels.length / 4;

            // Calcular nostalgia
            const results = calculateNostalgia(pixels, totalPixels);

            // Mostrar resultados en el HTML
            document.getElementById("preview").src = e.target.result;
            document.getElementById("rgb").textContent = `Average Color (RGB): R=${results.averageBrightness}, G=${results.averageContrast}`;
            document.getElementById("tone").textContent = `Tone Detected: ${results.nostalgiaLevel}`;
            document.getElementById("grayscale").textContent = `Grayscale (%): ${results.grayscalePercentage}%`;
            document.getElementById("sepia").textContent = `Sepia Tones (%): ${results.sepiaTonePercentage}%`;
            document.getElementById("contrast").textContent = `Average Contrast: ${results.averageContrast}`;
            document.getElementById("brightness").textContent = `Brightness: ${results.averageBrightness}`;
            document.getElementById("nostalgia-weight").textContent = `Weight of Nostalgia: ${results.nostalgiaLevel}`;

            // Mostrar el cuadro de resultados
            document.getElementById("output").style.display = "block";
        };
    };

    reader.readAsDataURL(file);
});

function calculateNostalgia(pixels, totalPixels) {
    let grayscaleCount = 0;
    let sepiaCount = 0;
    let contrastSum = 0;
    let brightnessSum = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        // Grayscale check
        if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
            grayscaleCount++;
        }

        // Sepia check
        if (r > g && r > b && Math.abs(r - g) < 30) {
            sepiaCount++;
        }

        // Contrast and brightness
        contrastSum += Math.max(r, g, b) - Math.min(r, g, b);
        brightnessSum += brightness;
    }

    // Calculate percentages
    const grayscalePercentage = Math.round((grayscaleCount / totalPixels) * 100);
    const sepiaTonePercentage = Math.round((sepiaCount / totalPixels) * 100);
    const averageContrast = Math.round(contrastSum / totalPixels);
    const averageBrightness = Math.round(brightnessSum / totalPixels);

    // Calculate nostalgia score
    let nostalgiaScore = 0;
    if (grayscalePercentage > 50) nostalgiaScore += 3;
    if (sepiaTonePercentage > 20) nostalgiaScore += 2;
    if (averageContrast < 80) nostalgiaScore += 1;

    // Determine nostalgia level
    let nostalgiaLevel = "LOW";
    if (nostalgiaScore >= 5) nostalgiaLevel = "HIGH";
    else if (nostalgiaScore >= 3) nostalgiaLevel = "MEDIUM";

    return {
        grayscalePercentage,
        sepiaTonePercentage,
        averageContrast,
        averageBrightness,
        nostalgiaLevel,
    };
}
