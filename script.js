document.getElementById("upload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0, g = 0, b = 0, brightness = 0, darkPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        brightness += avg;
        if (avg < 50) darkPixels++;
      }

      const totalPixels = canvas.width * canvas.height;
      const avgR = Math.round(r / totalPixels);
      const avgG = Math.round(g / totalPixels);
      const avgB = Math.round(b / totalPixels);
      const avgBrightness = Math.round(brightness / totalPixels);
      const darkAreaPercent = Math.round((darkPixels / totalPixels) * 100);

      // Updating the results
      document.getElementById("r").textContent = avgR;
      document.getElementById("g").textContent = avgG;
      document.getElementById("b").textContent = avgB;
      document.getElementById("tone").textContent = avgBrightness > 128 ? "Warm (Cálida)" : "Cool (Fría)";
      document.getElementById("saturation").textContent = Math.round((avgR + avgG + avgB) / 3);
      document.getElementById("contrast").textContent = Math.abs(avgR - avgB);
      document.getElementById("brightness").textContent = avgBrightness;
      document.getElementById("dark-areas").textContent = `${darkAreaPercent}%`;
      document.getElementById("nostalgia-weight").textContent = `${darkAreaPercent > 50 ? "High" : "Low"}`;

      // Display the image preview
      const preview = document.getElementById("image-preview");
      preview.innerHTML = "";
      preview.appendChild(img);
    };
  };
  reader.readAsDataURL(file);
});
