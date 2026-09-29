function procesarExcel() {
  const input = document.getElementById('input-excel');
  if (!input.files.length) return alert('Por favor selecciona un archivo Excel primero.');

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    // Crear estructura de auditoría
    const nuevoReporte = {
      nombre: file.name,
      tienda: estadoGlobal.usuarioActual.tienda === 'Todas' ? 'Automercado' : estadoGlobal.usuarioActual.tienda,
      estado: 'SIN INICIAR',
      productos: json.map(row => ({
        codigo: row['Código'] || row['Codigo'] || '000000',
        descripcion: row['Descripción'] || row['Descripcion'] || 'Producto Sin Nombre',
        precioNormal: row['Precio Normal'] || 0,
        precioOferta: row['Precio Oferta'] || 0,
        vencimiento: row['Vencimiento'] || 'N/A',
        estado: 'Pendiente',
        motivoRechazo: ''
      }))
    };

    estadoGlobal.archivosCargados.push(nuevoReporte);
    alert(`¡Archivo "${file.name}" cargado exitosamente!`);
    renderizarSelectArchivos();
    cambiarModulo('revision');
  };

  reader.readAsArrayBuffer(file);
}