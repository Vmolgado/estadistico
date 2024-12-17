const SHEET_ID = '1k1aLz6zTI5u-CLZL1uaceadzsmcbAtYgEkvBaUnFm70';
const API_KEY = 'AIzaSyDibUIuRbBxxRu_fn2hcJlbARS4GojpDxw';
const RANGE = 'INSTALACIONES Y SERVICIOS 2023';
const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

const reglasConteo = {
  avlInstalaciones: {
    servicio: ["INSTALACION", "ACCESORIO ADICIONAL", "CAMBIO DE ACCESORIO", "INSO", "REINSTALACION", "INSTALACION DEMO"],
    hardware: ["ARRASTRE", "ARRASTRE CON CAJA", "ARRASTRE RECUPERACION", "AUDIO 2 VIAS", "AUDIO 2 VIAS + JAMMER", "AVL BASICO", "AVL BASICO + ALARMA", "AVL BASICO + BUZZER", "CAJA AVL", "CANDADO", "JAMMER", "PORTATIL", "RECUPERACION", "SOLAR", "TEMPERATURA", "STOP/GIRO", "VIDEO"]
  },
  fuelInstalaciones: {
    servicio: ["INSTALACION", "INSTALACION DEMO", "INSO", "SENSOR ADICIONAL", "REINSTALACION", "ACCESORIO ADICIONAL"],
    hardware: ["COMBUSTIBLE", "COMBUSTIBLE + A2V", "COMBUSTIBLE + JAMMER", "COMBUSTIBLE + JAMMER + A2V", "COMBUSTIBLE + TEMPERATURA", "COMBUSTIBLE + TEMPERATURA + ALARMA", "COMBUSTIBLE + A2V + ENGANCHE"]
  },
  avlRevisiones: {
    servicio: ["CAMBIO DE ACCESORIO", "CAMBIO DE EQUIPO", "CAMBIO DE UNIDAD", "RETIRO", "RETIRO DEMO", "REVISION"],
    hardware: ["ARRASTRE", "ARRASTRE CON CAJA", "ARRASTRE RECUPERACION", "AUDIO 2 VIAS", "AUDIO 2 VIAS + JAMMER", "AVL BASICO", "AVL BASICO + ALARMA", "AVL BASICO + BUZZER", "CAJA AVL", "CANDADO", "JAMMER", "PORTATIL", "RECUPERACION", "SOLAR", "TEMPERATURA", "STOP/GIRO", "VIDEO"]
  },
  fuelRevisiones: {
    servicio: ["CAMBIO DE EQUIPO", "CAMBIO DE UNIDAD", "RETIRO", "REVISION", "CAMBIO SENSOR"],
    hardware: ["COMBUSTIBLE", "COMBUSTIBLE + A2V", "COMBUSTIBLE + JAMMER", "COMBUSTIBLE + JAMMER + A2V", "COMBUSTIBLE + TEMPERATURA", "COMBUSTIBLE + TEMPERATURA + ALARMA", "COMBUSTIBLE + A2V + ENGANCHE"]
  }
};

const MES_ORDENADO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

fetch(URL)
  .then(response => response.json())
  .then(data => {
    const values = data.values;

    if (!values || values.length === 0) {
      console.error("No se encontraron datos en la hoja.");
      return;
    }

    const groupedData = {};
    let totalAVLInst = 0, totalFuelInst = 0, totalAVLRev = 0, totalFuelRev = 0;

    for (let i = 1; i < values.length; i++) {
      const mes = values[i][2]?.trim().toLowerCase();
      const estatus = values[i][12]?.trim();
      const tipoServicio = values[i][8]?.trim();
      const tipoHardware = values[i][15]?.trim();

      if (estatus !== "REALIZADO" || !MES_ORDENADO.includes(mes)) continue;

      if (!groupedData[mes]) {
        groupedData[mes] = { avlInst: 0, fuelInst: 0, avlRev: 0, fuelRev: 0, total: 0 };
      }

      if (reglasConteo.avlInstalaciones.servicio.includes(tipoServicio) && reglasConteo.avlInstalaciones.hardware.includes(tipoHardware)) {
        groupedData[mes].avlInst++;
        totalAVLInst++;
      }
      if (reglasConteo.fuelInstalaciones.servicio.includes(tipoServicio) && reglasConteo.fuelInstalaciones.hardware.includes(tipoHardware)) {
        groupedData[mes].fuelInst++;
        totalFuelInst++;
      }
      if (reglasConteo.avlRevisiones.servicio.includes(tipoServicio) && reglasConteo.avlRevisiones.hardware.includes(tipoHardware)) {
        groupedData[mes].avlRev++;
        totalAVLRev++;
      }
      if (reglasConteo.fuelRevisiones.servicio.includes(tipoServicio) && reglasConteo.fuelRevisiones.hardware.includes(tipoHardware)) {
        groupedData[mes].fuelRev++;
        totalFuelRev++;
      }

      groupedData[mes].total =
        groupedData[mes].avlInst +
        groupedData[mes].fuelInst +
        groupedData[mes].avlRev +
        groupedData[mes].fuelRev;
    }

    const totalGeneral = totalAVLInst + totalFuelInst + totalAVLRev + totalFuelRev;

    // Generación de la tabla
    const tableBody = document.querySelector('#data-table tbody');
    MES_ORDENADO.forEach(mes => {
      if (groupedData[mes]) {
        tableBody.innerHTML += `
          <tr>
            <td class="bold">${mes.charAt(0).toUpperCase() + mes.slice(1)}</td>
            <td>${groupedData[mes].avlInst}</td>
            <td>${groupedData[mes].fuelInst}</td>
            <td>${groupedData[mes].avlRev}</td>
            <td>${groupedData[mes].fuelRev}</td>
            <td class="bold">${groupedData[mes].total}</td>
          </tr>`;
      }
    });

    tableBody.innerHTML += `
      <tr>
        <td class="bold">Total</td>
        <td class="bold">${totalAVLInst}</td>
        <td class="bold">${totalFuelInst}</td>
        <td class="bold">${totalAVLRev}</td>
        <td class="bold">${totalFuelRev}</td>
        <td class="bold">${totalGeneral}</td>
      </tr>`;

    const labels = MES_ORDENADO.map(mes => mes.charAt(0).toUpperCase() + mes.slice(1));

    const ctxComparison = document.getElementById('comparison-chart').getContext('2d');
    const ctxResults = document.getElementById('chart').getContext('2d');

    // Gráfico de Comparación
    new Chart(ctxComparison, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'AVL Instalaciones', data: MES_ORDENADO.map(mes => groupedData[mes]?.avlInst || 0), borderColor: 'blue', pointRadius: 5, pointBackgroundColor: 'blue' },
          { label: 'Fuel Instalaciones', data: MES_ORDENADO.map(mes => groupedData[mes]?.fuelInst || 0), borderColor: 'orange', pointRadius: 5, pointBackgroundColor: 'orange' },
          { label: 'AVL Revisiones', data: MES_ORDENADO.map(mes => groupedData[mes]?.avlRev || 0), borderColor: 'green', pointRadius: 5, pointBackgroundColor: 'green' },
          { label: 'Fuel Revisiones', data: MES_ORDENADO.map(mes => groupedData[mes]?.fuelRev || 0), borderColor: 'red', pointRadius: 5, pointBackgroundColor: 'red' }
        ]
      },
      options: {
        scales: { y: { beginAtZero: true, ticks: { stepSize: 50, max: 400 } } },
        plugins: { datalabels: { display: true, align: 'top', color: 'black', font: { weight: 'bold', size: 12 } } }
      },
      plugins: [ChartDataLabels]
    });

    // Gráfico de Resultados
    new Chart(ctxResults, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'INSTALACIONES', data: MES_ORDENADO.map(mes => (groupedData[mes]?.avlInst || 0) + (groupedData[mes]?.fuelInst || 0)), borderColor: 'green', pointRadius: 5, pointBackgroundColor: 'green' },
          { label: 'REVISIONES', data: MES_ORDENADO.map(mes => (groupedData[mes]?.avlRev || 0) + (groupedData[mes]?.fuelRev || 0)), borderColor: 'red', pointRadius: 5, pointBackgroundColor: 'red' }
        ]
      },
      options: {
        scales: { y: { beginAtZero: true, ticks: { stepSize: 50, max: 450 } } },
        plugins: { datalabels: { display: true, align: 'top', color: 'black', font: { weight: 'bold', size: 12 } } }
      },
      plugins: [ChartDataLabels]
    });
  })
  .catch(error => console.error('Error:', error));
