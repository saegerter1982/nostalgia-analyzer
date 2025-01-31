document.getElementById("upload").addEventListener("change", async function(event) {
    const file = event.target.files[0];
    if (file) {
        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);

        // Esperar a que la imagen se cargue
        image.onload = async () => {
            // Convertir la imagen en un tensor
            const tensor = tf.browser.fromPixels(image);

            // Calcular el promedio de colores (rojo, verde, azul)
            const meanColor = tensor.mean([0, 1]); // Promedio a lo largo de las dimensiones ancho y alto
            const rgb = await meanColor.array(); // Convertir tensor a array

            // Mostrar el resultado
            const resultText = `Mean Color (RGB): R=${Math.round(rgb[0])}, G=${Math.round(rgb[1])}, B=${Math.round(rgb[2])}`;
            document.getElementById("result").textContent = resultText;

            // Limpiar memoria
            tf.dispose(tensor);
            tf.dispose(meanColor);
        };
    }
});
