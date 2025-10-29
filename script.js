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
    let totalVideoInst = 0, totalVideoRev = 0;

    for (let i = 1; i < values.length; i++) {
      const mes = values[i][2]?.trim().toLowerCase();
      const estatus = values[i][12]?.trim()?.toUpperCase();
      const tipoServicio = values[i][8]?.trim()?.toUpperCase();
      const tipoHardware = values[i][15]?.trim()?.toUpperCase();

      if (estatus !== "REALIZADO" || !MES_ORDENADO.includes(mes)) continue;

      if (!groupedData[mes]) {
        groupedData[mes] = {
          avlInst: 0, fuelInst: 0, videoInst: 0,
          avlRev: 0,  fuelRev: 0,  videoRev: 0,
          total: 0
        };
      }

      if (reglasConteo.avlInstalaciones.servicio.includes(tipoServicio) &&
          reglasConteo.avlInstalaciones.hardware.includes(tipoHardware)) {
        groupedData[mes].avlInst++;
        totalAVLInst++;
        if (tipoHardware?.startsWith("VIDEO")) {
          groupedData[mes].videoInst++;
          totalVideoInst++;
        }
      }
      if (reglasConteo.fuelInstalaciones.servicio.includes(tipoServicio) &&
          reglasConteo.fuelInstalaciones.hardware.includes(tipoHardware)) {
        groupedData[mes].fuelInst++;
        totalFuelInst++;
      }

      if (reglasConteo.avlRevisiones.servicio.includes(tipoServicio) &&
          reglasConteo.avlRevisiones.hardware.includes(tipoHardware)) {
        groupedData[mes].avlRev++;
        totalAVLRev++;
        if (tipoHardware?.startsWith("VIDEO")) {
          groupedData[mes].videoRev++;
          totalVideoRev++;
        }
      }
      if (reglasConteo.fuelRevisiones.servicio.includes(tipoServicio) &&
          reglasConteo.fuelRevisiones.hardware.includes(tipoHardware)) {
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

    const tableBody = document.querySelector('#data-table tbody');
    MES_ORDENADO.forEach(mes => {
      const d = groupedData[mes];
      if (d) {
        tableBody.innerHTML += `
          <tr>
            <td class="bold">${mes.charAt(0).toUpperCase() + mes.slice(1)}</td>
            <td>${d.avlInst}</td>
            <td>${d.fuelInst}</td>
            <td>${d.videoInst}</td>
            <td>${d.avlRev}</td>
            <td>${d.fuelRev}</td>
            <td>${d.videoRev}</td>
            <td class="bold">${d.total}</td>
          </tr>`;
      }
    });

    tableBody.innerHTML += `
      <tr>
        <td class="bold">Total</td>
        <td class="bold">${totalAVLInst}</td>
        <td class="bold">${totalFuelInst}</td>
        <td class="bold">${totalVideoInst}</td>
        <td class="bold">${totalAVLRev}</td>
        <td class="bold">${totalFuelRev}</td>
        <td class="bold">${totalVideoRev}</td>
        <td class="bold">${totalGeneral}</td>
      </tr>`;

    if (window.ChartDataLabels) {
      Chart.register(ChartDataLabels);
    }

    const labels = MES_ORDENADO.map(mes => mes.charAt(0).toUpperCase() + mes.slice(1));

    new Chart(document.getElementById('comparison-chart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'AVL Instalaciones',
            data: MES_ORDENADO.map(m => groupedData[m]?.avlInst  || 0),
            borderColor: 'blue', borderWidth: 2, pointRadius: 5, pointBackgroundColor: 'blue', order: 1
          },
          { label: 'Fuel Instalaciones',
            data: MES_ORDENADO.map(m => groupedData[m]?.fuelInst || 0),
            borderColor: 'orange', borderWidth: 2, pointRadius: 5, pointBackgroundColor: 'orange', order: 1
          },
          { label: 'AVL Revisiones',
            data: MES_ORDENADO.map(m => groupedData[m]?.avlRev   || 0),
            borderColor: 'green', borderWidth: 2, pointRadius: 5, pointBackgroundColor: 'green', order: 1
          },
          { label: 'Fuel Revisiones',
            data: MES_ORDENADO.map(m => groupedData[m]?.fuelRev  || 0),
            borderColor: 'red', borderWidth: 2, pointRadius: 5, pointBackgroundColor: 'red', order: 1
          },
          { label: 'Video Instalaciones',
            data: MES_ORDENADO.map(m => groupedData[m]?.videoInst || 0),
            borderColor: 'pink', borderWidth: 2, pointRadius: 6, pointBackgroundColor: 'pink', order: 10
          },
          { label: 'Video Revisiones',
            data: MES_ORDENADO.map(m => groupedData[m]?.videoRev || 0),
            borderColor: 'purple', borderWidth: 2, pointRadius: 6, pointBackgroundColor: 'purple', order: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 50, font: { weight: 'bold' }, color: '#000' }
          },
          x: { ticks: { font: { weight: 'bold' }, color: '#000' } }
        },
        plugins: {
          legend: { display: true },
          datalabels: {
            display: true,
            color: 'black',
            font: { weight: 'bold', size: 12 },
            align: 'top',
            anchor: 'end',
            offset: 8,
            clip: false,
            formatter: (v) => (v > 0 ? v : null)
          }
        }
      }
    });

    new Chart(document.getElementById('chart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'INSTALACIONES',
            data: MES_ORDENADO.map(m => (groupedData[m]?.avlInst || 0) + (groupedData[m]?.fuelInst || 0)),
            borderColor: 'green',
            backgroundColor: 'rgba(0, 128, 0, 0.2)',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: 'green'
          },
          {
            label: 'REVISIONES',
            data: MES_ORDENADO.map(m => (groupedData[m]?.avlRev || 0) + (groupedData[m]?.fuelRev || 0)),
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: 'red'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 24 } },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: 550,
            ticks: { stepSize: 50, font: { weight: 'bold' }, color: '#000' }
          },
          x: {
            ticks: { font: { weight: 'bold' }, color: '#000' }
          }
        },
        plugins: {
          legend: { display: true },
          datalabels: {
            display: true,
            color: 'black',
            font: { weight: 'bold', size: 12 },
            align: 'top',
            anchor: 'end',
            offset: 8,
            clip: false,
            formatter: (v) => (v > 0 ? v : null)
          }
        }
      }
    });
  })
  .catch(error => console.error('Error:', error));
