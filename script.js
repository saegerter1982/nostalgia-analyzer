document.getElementById("upload").addEventListener("change", async function(event) {
    const file = event.target.files[0];
    if (file) {
        const image = new Image();
        image.src = URL.createObjectURL(file);

        // Procesar la imagen al cargar
        image.onload = async () => {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            canvas.style.display = "block";
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            // Convertir la imagen a un tensor
            const tensor = tf.browser.fromPixels(canvas);

            // Calcular el promedio de colores
            const meanColor = tensor.mean([0, 1]);
            const rgb = await meanColor.array();

            // Mostrar el resultado
            document.getElementById("result").innerHTML = `
                <p>Average Color (RGB): 
                R=${Math.round(rgb[0])}, 
                G=${Math.round(rgb[1])}, 
                B=${Math.round(rgb[2])}</p>
            `;

            // Limpiar memoria
            tf.dispose(tensor);
            tf.dispose(meanColor);
        };
    }
});
