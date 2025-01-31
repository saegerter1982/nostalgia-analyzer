document.getElementById('upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            let totalR = 0, totalG = 0, totalB = 0, count = 0;
            let totalSaturation = 0, totalContrast = 0;

            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                totalR += r;
                totalG += g;
                totalB += b;
                count++;

                // Calcular saturación y contraste
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                totalSaturation += max - min; // Saturación
                totalContrast += max + min;  // Contraste
            }

            const avgR = totalR / count;
            const avgG = totalG / count;
            const avgB = totalB / count;
            const avgSaturation = totalSaturation / count;
            const avgContrast = totalContrast / (2 * count);

            const tone = avgR > avgB ? 'Warm (Cálida)' : 'Cool (Fría)';
            const nostalgiaWeight = Math.min(100, Math.round((avgSaturation / 255 + avgContrast / 255) * 50));

            // Mostrar resultados con explicaciones
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
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});
