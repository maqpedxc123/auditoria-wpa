function letraAIndice(letra) {
  if (!letra) return -1;
  letra = letra.trim().toUpperCase();
  let indice = 0;
  for (let i = 0; i < letra.length; i++) {
    indice = indice * 26 + (letra.charCodeAt(i) - 64);
  }
  return indice - 1;
}

function procesarExcelAuditoria() {
  const input = document.getElementById('input-excel');
  const colCod = document.getElementById('col-codigo').value;
  const colNom = document.getElementById('col-nombre').value;
  const colPNormal = document.getElementById('col-precio-normal').value;
  const colPOferta = document.getElementById('col-precio-oferta').value;
  const colAhorro = document.getElementById('col-ahorro').value;

  if (!input.files || !input.files.length) {
    return alert('Selecciona un archivo Excel primero.');
  }

  if (!colCod || !colNom || !colPNormal || !colPOferta) {
    return alert('Debes indicar al menos las columnas de Código, Nombre, Precio Normal y Precio Oferta.');
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
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const filas = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (filas.length < 2) return alert('El archivo no contiene filas de datos.');

      const productos = [];

      for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];
        if (!fila || fila.length === 0) continue;

        const codigo = fila[idxCod] !== undefined ? String(fila[idxCod]).trim() : '';
        const descripcion = fila[idxNom] !== undefined ? String(fila[idxNom]).trim() : '';
        const precioNormal = fila[idxPNormal] !== undefined ? parseFloat(fila[idxPNormal]) || 0 : 0;
        const precioOferta = fila[idxPOferta] !== undefined ? parseFloat(fila[idxPOferta]) || 0 : 0;
        
        // Si no se indica columna de ahorro, lo calcula automáticamente
        let ahorro = 0;
        if (idxAhorro >= 0 && fila[idxAhorro] !== undefined) {
          ahorro = parseFloat(fila[idxAhorro]) || 0;
        } else {
          ahorro = Math.max(0, precioNormal - precioOferta);
        }

        if (codigo || descripcion) {
          productos.push({
            codigo: codigo || 'SIN_CODIGO',
            descripcion: descripcion || 'Producto sin descripción',
            precioNormal,
            precioOferta,
            ahorro,
            vencimiento: 'N/A',
            estado: 'Pendiente',
            motivoRechazo: ''
          });
        }
      }

      const tiendaUser = (estadoGlobal.usuarioActual && estadoGlobal.usuarioActual.tienda !== 'Todas')
        ? estadoGlobal.usuarioActual.tienda
        : 'Automercado';

      const nuevoReporte = {
        nombre: file.name,
        tienda: tiendaUser,
        fechaCarga: new Date().toLocaleDateString('es-CR'),
        estado: 'SIN INICIAR',
        productos
      };

      estadoGlobal.archivosCargados.push(nuevoReporte);
      alert(`¡Éxito! Archivo "${file.name}" cargado con ${productos.length} productos de oferta.`);

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