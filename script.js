document.getElementById("upload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        // Muestra un gráfico ficticio como demostración
        const ctx = document.getElementById("chart").getContext("2d");
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Tonos Cálidos', 'Texturas', 'Objetos', 'Viñeteado'],
                datasets: [{
                    label: 'Peso Nostálgico (%)',
                    data: [40, 20, 30, 10],
                    backgroundColor: ['#FFCC00', '#FFA500', '#FF5733', '#C70039']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Análisis del Peso Nostálgico'
                    }
                }
            }
        });
    }
});
