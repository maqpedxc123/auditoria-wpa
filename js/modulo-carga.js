// Convertir letras de columna Excel (A, B, C...) a índices numéricos (0, 1, 2...)
function letraAIndice(letra) {
  if (!letra) return -1;
  letra = letra.trim().toUpperCase();
  let indice = 0;
  for (let i = 0; i < letra.length; i++) {
    indice = indice * 26 + (letra.charCodeAt(i) - 64);
  }
  return indice - 1;
}

// =========================================================
// PASO 1: CARGA DEL INVENTARIO MAESTRO (Solo Admin)
// =========================================================
function procesarExcelMaestro() {
  const input = document.getElementById('input-excel-maestro');
  const colCod = document.getElementById('col-maestro-codigo').value;
  const colNom = document.getElementById('col-maestro-nombre').value;
  const colExist = document.getElementById('col-maestro-existencia').value;

  if (!input.files || !input.files.length) {
    return alert('Selecciona el archivo Excel del Inventario Maestro.');
  }

  if (!colCod || !colNom || !colExist) {
    return alert('Indica las letras de las columnas de Código, Nombre y Existencia.');
  }

  const idxCod = letraAIndice(colCod);
  const idxNom = letraAIndice(colNom);
  const idxExist = letraAIndice(colExist);

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const mapaMaestro = {};
      let totalCargados = 0;

      for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];
        if (!fila || fila.length === 0) continue;

        const codigo = fila[idxCod] !== undefined ? String(fila[idxCod]).trim() : '';
        const descripcion = fila[idxNom] !== undefined ? String(fila[idxNom]).trim() : '';
        const existencia = fila[idxExist] !== undefined ? parseFloat(fila[idxExist]) || 0 : 0;

        if (codigo) {
          mapaMaestro[codigo] = { descripcion, existencia };
          totalCargados++;
        }
      }

      // Guardar el mapa maestro global en localStorage
      localStorage.setItem('pwa_inventario_maestro', JSON.stringify(mapaMaestro));
      alert(`¡Inventario Maestro actualizado con éxito!\nTotal de productos registrados: ${totalCargados}`);

      input.value = '';
    } catch (err) {
      console.error(err);
      alert('Error al leer el archivo del Inventario Maestro.');
    }
  };

  reader.readAsArrayBuffer(file);
}

// =========================================================
// PASO 2: CARGA DE REPORTES DE OFERTAS / AUDITORÍA DIARIA
// =========================================================
function procesarExcelAuditoria() {
  const input = document.getElementById('input-excel');
  const colCod = document.getElementById('col-codigo').value;
  const colNom = document.getElementById('col-nombre').value;
  const colPNormal = document.getElementById('col-precio-normal').value;
  const colPOferta = document.getElementById('col-precio-oferta').value;
  const colAhorro = document.getElementById('col-ahorro').value;

  if (!input.files || !input.files.length) {
    return alert('Selecciona un archivo Excel de ofertas.');
  }

  if (!colCod || !colNom || !colPNormal || !colPOferta) {
    return alert('Indica las columnas de Código, Nombre, Precio Normal y Precio Oferta.');
  }

  // Leer la base Maestro guardada
  const inventarioMaestro = JSON.parse(localStorage.getItem('pwa_inventario_maestro')) || {};

  if (Object.keys(inventarioMaestro).length === 0) {
    return alert('⚠️ Aún no se ha cargado el Inventario Maestro. Un usuario Admin debe cargarlo primero en el Panel de Admin.');
  }

  const idxCod = letraAIndice(colCod);
  const idxNom = letraAIndice(colNom);
  const idxPNormal = letraAIndice(colPNormal);
  const idxPOferta = letraAIndice(colPOferta);
  const idxAhorro = letraAIndice(colAhorro);

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const productosFiltrados = [];
      let excluidosSinStock = 0;

      for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];
        if (!fila || fila.length === 0) continue;

        const codigo = fila[idxCod] !== undefined ? String(fila[idxCod]).trim() : '';
        const descripcion = fila[idxNom] !== undefined ? String(fila[idxNom]).trim() : '';
        const precioNormal = fila[idxPNormal] !== undefined ? parseFloat(fila[idxPNormal]) || 0 : 0;
        const precioOferta = fila[idxPOferta] !== undefined ? parseFloat(fila[idxPOferta]) || 0 : 0;

        let ahorro = 0;
        if (idxAhorro >= 0 && fila[idxAhorro] !== undefined) {
          ahorro = parseFloat(fila[idxAhorro]) || 0;
        } else {
          ahorro = Math.max(0, precioNormal - precioOferta);
        }

        // CRUCE CON EL INVENTARIO MAESTRO: Solo si existe y tiene existencia > 0
        const itemMaestro = inventarioMaestro[codigo];

        if (itemMaestro && itemMaestro.existencia > 0) {
          productosFiltrados.push({
            codigo,
            descripcion: descripcion || itemMaestro.descripcion,
            existencia: itemMaestro.existencia,
            precioNormal,
            precioOferta,
            ahorro,
            vencimiento: 'N/A',
            estado: 'Pendiente',
            motivoRechazo: ''
          });
        } else {
          excluidosSinStock++;
        }
      }

      if (productosFiltrados.length === 0) {
        return alert('Ningún producto del archivo tiene stock activo (> 0) en la Base Maestro.');
      }

      const tiendaUser = (estadoGlobal.usuarioActual && estadoGlobal.usuarioActual.tienda !== 'Todas')
        ? estadoGlobal.usuarioActual.tienda
        : 'Automercado';

      const nuevoReporte = {
        nombre: file.name,
        tienda: tiendaUser,
        fechaCarga: new Date().toLocaleDateString('es-CR'),
        estado: 'SIN INICIAR',
        productos: productosFiltrados
      };

      estadoGlobal.archivosCargados.push(nuevoReporte);

      alert(`¡Carga exitosa!\n\n✅ Productos listos para revisión (existencia > 0): ${productosFiltrados.length}\n🚫 Productos excluidos por sin stock: ${excluidosSinStock}`);

      input.value = '';
      renderizarSelectArchivos();
      cambiarModulo('revision');

    } catch (err) {
      console.error(err);
      alert('Error al procesar el archivo Excel.');
    }
  };

  reader.readAsArrayBuffer(file);
}