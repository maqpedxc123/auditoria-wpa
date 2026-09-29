// Convertir letras de columna Excel (A, B, C...) a índices numéricos (0, 1, 2...)
function letraAIndice(letra) {
  if (!letra) return -1;
  letra = letra.trim().toUpperCase();
  let indice = 0;
  for (let i = 0; i < letra.length; i++) {
    indice = indice * 26 + (letra.charCodeAt(i) - 64);
  }
  return indice - 1; // Base cero para arreglos JavaScript
}

function procesarExcelConMapeo() {
  const input = document.getElementById('input-excel');
  const colCodigoLetra = document.getElementById('col-codigo').value;
  const colNombreLetra = document.getElementById('col-nombre').value;
  const colExistenciaLetra = document.getElementById('col-existencia').value;

  // Validaciones de entradas
  if (!input.files || !input.files.length) {
    return alert('Por favor selecciona un archivo Excel (.xlsx o .xlsm).');
  }

  if (!colCodigoLetra || !colNombreLetra || !colExistenciaLetra) {
    return alert('Debes indicar las 3 letras de columna (Código, Nombre y Existencia).');
  }

  const idxCodigo = letraAIndice(colCodigoLetra);
  const idxNombre = letraAIndice(colNombreLetra);
  const idxExistencia = letraAIndice(colExistenciaLetra);

  if (idxCodigo < 0 || idxNombre < 0 || idxExistencia < 0) {
    return alert('Asegúrate de ingresar letras válidas de columna (ejemplo: A, B, C).');
  }

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir la hoja a una matriz bidimensional [fila][columna]
      const filas = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (filas.length < 2) {
        return alert('El archivo seleccionado está vacío o no contiene filas de datos.');
      }

      const productosExtraidos = [];

      // Omitimos la fila 0 (encabezados) y procesamos cada fila de datos
      for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];
        if (!fila || fila.length === 0) continue;

        const codigoVal = fila[idxCodigo] !== undefined ? String(fila[idxCodigo]).trim() : '';
        const nombreVal = fila[idxNombre] !== undefined ? String(fila[idxNombre]).trim() : '';
        const existenciaVal = fila[idxExistencia] !== undefined ? parseFloat(fila[idxExistencia]) || 0 : 0;

        // Extraer únicamente filas que contengan al menos código o nombre
        if (codigoVal || nombreVal) {
          productosExtraidos.push({
            codigo: codigoVal || 'SIN_CODIGO',
            descripcion: nombreVal || 'Producto sin descripción',
            existencia: existenciaVal,
            precioNormal: 0,
            precioOferta: 0,
            vencimiento: 'N/A',
            estado: 'Pendiente',
            motivoRechazo: ''
          });
        }
      }

      if (productosExtraidos.length === 0) {
        return alert('No se encontraron datos válidos en las columnas indicadas.');
      }

      // Guardar el reporte procesado en la estructura global
      const tiendaAsignada = (estadoGlobal.usuarioActual && estadoGlobal.usuarioActual.tienda !== 'Todas') 
        ? estadoGlobal.usuarioActual.tienda 
        : 'Automercado';

      const nuevoReporte = {
        nombre: file.name,
        tienda: tiendaAsignada,
        fechaCarga: new Date().toLocaleDateString('es-CR'),
        estado: 'SIN INICIAR',
        productos: productosExtraidos
      };

      estadoGlobal.archivosCargados.push(nuevoReporte);

      alert(`¡Éxito! Se procesó el archivo "${file.name}" cargando ${productosExtraidos.length} productos con sus existencias.`);

      // Limpiar formulario y redireccionar al Módulo 2 (Revisión)
      input.value = '';
      renderizarSelectArchivos();
      cambiarModulo('revision');

    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al leer el archivo Excel. Verifica que el formato sea correcto.');
    }
  };

  reader.readAsArrayBuffer(file);
}