document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let rTotal = 0, gTotal = 0, bTotal = 0;
                let saturationTotal = 0;
                let contrastTotal = 0;

                const numPixels = data.length / 4;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    rTotal += r;
                    gTotal += g;
                    bTotal += b;

                    // Saturation calculation
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    saturationTotal += max - min;

                    // Contrast calculation (relative to a neutral gray)
                    const avg = (r + g + b) / 3;
                    contrastTotal += Math.abs(avg - 128);
                }

                const avgR = rTotal / numPixels;
                const avgG = gTotal / numPixels;
                const avgB = bTotal / numPixels;
                const avgSaturation = saturationTotal / numPixels;
                const avgContrast = contrastTotal / numPixels;

                // Determine tone
                const tone = avgR > avgG && avgR > avgB ? "Warm (Cálida)" :
                              avgB > avgR && avgB > avgG ? "Cool (Fría)" : "Neutral";

                // Calculate weight of nostalgia
                const nostalgiaWeight = Math.min(100, Math.round((avgSaturation / 255 + avgContrast / 255) * 50));

                // Update result
                document.getElementById('result').innerHTML = `
                    <p><strong>Average Color (RGB):</strong> R=${Math.round(avgR)}, G=${Math.round(avgG)}, B=${Math.round(avgB)}</p>
                    <p><strong>Tone Detected:</strong> ${tone}</p>
                    <p><strong>Average Saturation:</strong> ${Math.round(avgSaturation)}</p>
                    <p><strong>Average Contrast:</strong> ${Math.round(avgContrast)}</p>
                    <p><strong>Weight of Nostalgia:</strong></p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${nostalgiaWeight}%;"></div>
                    </div>
                    <p>El peso de la nostalgia combina saturación, contraste y tonos cálidos/fríos para reflejar la emoción evocada por la imagen.</p>
                `;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
