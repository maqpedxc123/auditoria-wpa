let chartAnalitica = null;

function inicializarAnalitica() {
  const user = estadoGlobal.usuarioActual;
  const selectTienda = document.getElementById('select-tienda-analitica');
  
  // Si es auditor, se fija su tienda; si es Admin, se listan todas
  if (user.rol === 'Auditor') {
    selectTienda.innerHTML = `<option value="${user.tienda}">${user.tienda}</option>`;
    selectTienda.disabled = true;
  } else {
    selectTienda.disabled = false;
    selectTienda.innerHTML = `
      <option value="Automercado">Automercado</option>
      <option value="Limitada">Limitada</option>
      <option value="Todas">Todas las Tiendas</option>
    `;
  }

  actualizarGraficas();
}

function actualizarGraficas() {
  const ctx = document.getElementById('chartAnalitica').getContext('2d');
  
  // Datos de prueba simulando cálculo consolidado
  const archivosEvaluados = 2;
  const notaConsolidada = 93; // Promedio entre auditorías finalizadas (ej. 86% y 100%)

  document.getElementById('kpi-nota').innerText = `${notaConsolidada}%`;
  document.getElementById('kpi-archivos').innerText = archivosEvaluados;

  if (chartAnalitica) chartAnalitica.destroy();

  chartAnalitica = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['14 Sept', '22 Sept', '28 Sept'],
      datasets: [{
        label: 'Promedio Cumplimiento (%)',
        data: [86, 100, 93],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: { y: { min: 0, max: 100 } }
    }
  });
}