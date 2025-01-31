// Cuando se sube una imagen
document.getElementById('upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Leer la imagen como URL
    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.onload = function () {
            // Redimensionar imagen al canvas
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Obtener datos de píxeles
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            let totalR = 0, totalG = 0, totalB = 0, count = 0;

            // Sumar valores de cada píxel
            for (let i = 0; i < pixels.length; i += 4) {
                totalR += pixels[i];     // Red
                totalG += pixels[i + 1]; // Green
                totalB += pixels[i + 2]; // Blue
                count++;
            }

            // Promedio de colores
            const avgR = totalR / count;
            const avgG = totalG / count;
            const avgB = totalB / count;

            // Detectar tono general (cálido o frío)
            const tone = avgR > avgB ? 'Warm (Cálida)' : 'Cool (Fría)';

            // Mostrar resultados
            document.getElementById('result').innerHTML = `
                <p>Average Color (RGB): R=${Math.round(avgR)}, G=${Math.round(avgG)}, B=${Math.round(avgB)}</p>
                <p>Tone Detected: ${tone}</p>
            `;
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});
