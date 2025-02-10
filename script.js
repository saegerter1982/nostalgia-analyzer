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

            // 1) Get the top 5 colors (Binned approach):
            const topColors = getTopColorsBinned(pixels, 5, 32);
            // If you prefer the exact approach, use:
            // const topColors = getTopColors(pixels, 5);

            // 2) Display them
            const paletteContainer = document.getElementById("color-palette");
            paletteContainer.innerHTML = "";
            topColors.forEach(([r, g, b]) => {
                const colorBlock = document.createElement("div");
                colorBlock.style.width = "40px";
                colorBlock.style.height = "40px";
                colorBlock.style.marginRight = "5px";
                colorBlock.style.display = "inline-block";
                colorBlock.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                paletteContainer.appendChild(colorBlock);
            });
            // ADD color-palette TITLE 
            const colorPaletteTitle = document.createElement("p");
            colorPaletteTitle.textContent = "Color Palette:";
            paletteContainer.insertBefore(colorPaletteTitle, paletteContainer.firstChild);


            // 3) Calculate the nostalgia metrics
            const results = calculateNostalgia(pixels, totalPixels);

            // 4) Show results
            document.getElementById("preview").src = e.target.result;
            document.getElementById("rgb").textContent =
                `Average Color (RGB): R=${results.averageBrightness}, G=${results.averageContrast}`;
            document.getElementById("tone").textContent =
                `Tone Detected: ${results.nostalgiaLevel}`;
            document.getElementById("grayscale").textContent =
                `Grayscale (%): ${results.grayscalePercentage}%`;
            document.getElementById("sepia").textContent =
                `Sepia Tones (%): ${results.sepiaTonePercentage}%`;
            document.getElementById("contrast").textContent =
                `Average Contrast: ${results.averageContrast}`;
            document.getElementById("brightness").textContent =
                `Brightness: ${results.averageBrightness}`;
            document.getElementById("nostalgia-weight").textContent =
                `Weight of Nostalgia: ${results.nostalgiaLevel}`;

            // 5) Update Nostalgia Meter for the 6 vertical bars
            updateBars(results.nostalgiaScore);

            // If you want the horizontal meter too (the "nostalgia-bar"):
            const nostalgiaPercent = Math.round((results.nostalgiaScore / 6) * 100);
            //document.getElementById("nostalgia-bar").style.width = nostalgiaPercent + "%";
            document.getElementById("nostalgia-label").textContent =
                `Nostalgia Meter: ${nostalgiaPercent}%`;

            // Finally, show the output container
            document.getElementById("output").style.display = "block";
            document.getElementById("result-box").style.display = "flex";


            //          const nostalgiaBar = document.getElementById("nostalgia-bar");
            const nostalgiaLabel = document.getElementById("nostalgia-label");
            nostalgiaBar.style.width = nostalgiaPercent + "%";
            nostalgiaLabel.textContent = `Nostalgia Meter: ${nostalgiaPercent}%`;

            // Finally, show the output container
        };
    };
    reader.readAsDataURL(file);
});

// ----------------------------------------------------
// Calculate Nostalgia
// ----------------------------------------------------
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

    // Calculate nostalgia score (0..6)
    let nostalgiaScore = 0;
    if (grayscalePercentage > 50) nostalgiaScore += 3;
    if (sepiaTonePercentage > 20) nostalgiaScore += 2;
    if (averageContrast < 80) nostalgiaScore += 1;


    // Determine nostalgia level
    let nostalgiaLevel = "LOW";
    if (nostalgiaScore >= 5) {
        nostalgiaLevel = "HIGH";
    } else if (nostalgiaScore >= 3) {
        nostalgiaLevel = "MEDIUM";
    }

    return {
        grayscalePercentage,
        sepiaTonePercentage,
        averageContrast,
        averageBrightness,
        nostalgiaLevel,
        nostalgiaScore, // 0..6
    };
}

// ----------------------------------------------------
// Original exact approach (optional)
// ----------------------------------------------------
function getTopColors(pixels, topCount) {
    const colorCountMap = {};

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // We ignore the alpha channel (pixels[i+3]) for color extraction
        const key = `${r},${g},${b}`;
        colorCountMap[key] = (colorCountMap[key] || 0) + 1;
    }

    const colorFreqArray = Object.keys(colorCountMap).map((color) => ({
        color,
        count: colorCountMap[color],
    }));

    colorFreqArray.sort((a, b) => b.count - a.count);

    return colorFreqArray
        .slice(0, topCount)
        .map((item) => item.color.split(",").map((num) => parseInt(num, 10)));
}

// ----------------------------------------------------
// Binning-based approach: getTopColorsBinned
// ----------------------------------------------------
/**
 * Groups (bins) colors by a chosen binSize (e.g. 32),
 * so small variations of color are treated as the same color.
 *
 * @param {Uint8ClampedArray} pixels - The image data array [r, g, b, a, ...]
 * @param {number} topCount - How many top colors to return
 * @param {number} [binSize=32] - The size of each bin (32 => 8 bins per channel)
 * @returns {Array<Array<number>>} Array of top colors, each is [r, g, b]
 */
function getTopColorsBinned(pixels, topCount, binSize = 32) {
    const colorCountMap = {};

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];
        // Ignore alpha channel

        // Round each channel down to the nearest bin
        r = Math.floor(r / binSize) * binSize;
        g = Math.floor(g / binSize) * binSize;
        b = Math.floor(b / binSize) * binSize;

        const key = `${r},${g},${b}`;
        colorCountMap[key] = (colorCountMap[key] || 0) + 1;
    }

    const colorFreqArray = Object.keys(colorCountMap).map((color) => ({
        color,
        count: colorCountMap[color],
    }));

    // Sort by frequency descending
    colorFreqArray.sort((a, b) => b.count - a.count);

    return colorFreqArray
        .slice(0, topCount)
        .map(({ color }) => color.split(",").map((val) => parseInt(val, 10)));
}



function updateBars(nostalgiaScore) {
    // Bar colors: black, dark gray, medium gray, brownish-gray, darker brown, dark-brown
    const colors = [
        "#dcdcdc", // bar1: light gray
        "#b7b7b7", // bar2: medium-light gray
        "#949494", // bar3: medium gray
        "#707070", // bar4: darker gray
        "#4c4c4c", // bar5: deep gray
        "#232323"  // bar6: near-black
    ];

    // Example heights
    const barHeights = [50, 70, 90, 110, 130, 150];

    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById("bar" + i);
        if (i <= nostalgiaScore) {
            bar.style.height = barHeights[i - 1] + "px";
            bar.style.backgroundColor = colors[i - 1];
        } else {
            bar.style.height = "5px";
            bar.style.backgroundColor = "#ccc";
        }
    }
}
