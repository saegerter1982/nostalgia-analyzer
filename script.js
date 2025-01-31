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
            for (let i = 0; i < pixels.length; i += 4) {
                totalR += pixels[i];
                totalG += pixels[i + 1];
                totalB += pixels[i + 2];
                count++;
            }

            const avgR = totalR / count;
            const avgG = totalG / count;
            const avgB = totalB / count;

            const desaturation = Math.abs(avgR - avgG - avgB) / 3;
            const tone = avgR > avgB ? 'Warm (Cálida)' : 'Cool (Fría)';
            const nostalgiaWeight = Math.min(100, Math.round((desaturation + avgR / 255) * 50));

            // Mostrar resultados
            document.getElementById('result').innerHTML = `
                <p>Average Color (RGB): R=${Math.round(avgR)}, G=${Math.round(avgG)}, B=${Math.round(avgB)}</p>
                <p>Tone Detected: ${tone}</p>
                <p>Weight of Nostalgia:</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${nostalgiaWeight}%"></div>
                </div>
            `;
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});
