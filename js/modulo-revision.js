function renderizarSelectArchivos() {
  const select = document.getElementById('select-archivos');
  select.innerHTML = '';

  // Filtrar archivos por la tienda del usuario
  let lista = estadoGlobal.archivosCargados.filter(a => 
    estadoGlobal.usuarioActual.rol === 'Master' || a.tienda === estadoGlobal.usuarioActual.tienda
  );

  // REORDENAMIENTO AUTOMÁTICO: EN PROGRESO y SIN INICIAR primero, FINALIZADO al fondo
  lista.sort((a, b) => {
    if (a.estado === 'FINALIZADO' && b.estado !== 'FINALIZADO') return 1;
    if (a.estado !== 'FINALIZADO' && b.estado === 'FINALIZADO') return -1;
    return 0;
  });

  lista.forEach((arch, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.innerText = `${arch.nombre} [${arch.estado}]`;
    if (arch.estado === 'FINALIZADO') opt.style.color = 'green';
    select.appendChild(opt);
  });

  if (lista.length > 0) cargarArchivoSeleccionado();
}

function filtrarProductos() {
  const query = document.getElementById('input-busqueda').value.trim();
  const archivo = estadoGlobal.archivosCargados[estadoGlobal.archivoActivoIndex];
  if (!archivo) return;

  const contenedor = document.getElementById('contenedor-productos');
  contenedor.innerHTML = '';

  archivo.productos.forEach((prod, index) => {
    const codStr = String(prod.codigo);
    // BÚSQUEDA PARCIAL POR ÚLTIMOS 6 DÍGITOS DE DERECHA A IZQUIERDA
    const coincide6Digitos = query.length >= 1 && codStr.endsWith(query);
    const coincideTexto = prod.descripcion.toLowerCase().includes(query.toLowerCase());

    if (!query || coincide6Digitos || coincideTexto) {
      contenedor.appendChild(crearTarjetaProducto(prod, index));
    }
  });
}

function crearTarjetaProducto(prod, index) {
  const card = document.createElement('div');
  card.className = "bg-white p-3 rounded-lg shadow border flex justify-between items-center";
  card.innerHTML = `
    <div>
      <h4 class="font-bold text-xs text-gray-800">${prod.descripcion}</h4>
      <p class="text-[10px] text-gray-500">Cód: ${prod.codigo} | Venc: ${prod.vencimiento}</p>
      <p class="text-xs font-black text-red-600">₡${prod.precioOferta} <span class="line-through text-gray-400 font-normal text-[10px]">₡${prod.precioNormal}</span></p>
    </div>
    <div class="flex gap-1">
      <button onclick="marcarAprobado(${index})" class="bg-green-100 text-green-700 p-2 rounded-full font-bold hover:bg-green-200">✓</button>
      <button onclick="abrirModalMotivos(${index})" class="bg-red-100 text-red-700 p-2 rounded-full font-bold hover:bg-red-200">✕</button>
    </div>
  `;
  return card;
}

// MANEJO DE MODAL DE DONA (AVANCE DE AUDITORÍA)
let chartDona = null;
function abrirModalResumen() {
  const arch = estadoGlobal.archivosCargados[estadoGlobal.archivoActivoIndex];
  if (!arch) return alert('Selecciona un archivo activo.');

  document.getElementById('modal-resumen').classList.remove('hidden');
  document.getElementById('resumen-archivo-nombre').innerText = arch.nombre;

  const correctos = arch.productos.filter(p => p.estado === 'Aprobado').length;
  const incorrectos = arch.productos.filter(p => p.estado === 'Rechazado').length;
  const escaneados = correctos + incorrectos;
  const nota = arch.productos.length > 0 ? Math.round((correctos / arch.productos.length) * 100) : 0;

  document.getElementById('cnt-correctos').innerText = correctos;
  document.getElementById('cnt-incorrectos').innerText = incorrectos;
  document.getElementById('cnt-escaneados').innerText = escaneados;

  // Renderizar Dona Chart
  const ctx = document.getElementById('chartDonaResumen').getContext('2d');
  if (chartDona) chartDona.destroy();
  chartDona = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Correctos', 'Incorrectos', 'Pendientes'],
      datasets: [{
        data: [correctos, incorrectos, arch.productos.length - escaneados],
        backgroundColor: ['#16a34a', '#dc2626', '#9ca3af']
      }]
    },
    options: { plugins: { legend: { display: false } }, cutout: '70%' }
  });
}

function cerrarModalResumen() {
  document.getElementById('modal-resumen').classList.add('hidden');
}