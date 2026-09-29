let estadoGlobal = {
  usuarioActual: null,
  archivosCargados: [],
  archivoActivoIndex: -1,
  productoSeleccionadoIndex: -1
};

function iniciarSesion() {
  cargarBaseDatosLocal(); 
  const email = document.getElementById('login-email').value.trim();
  const usuariosGuardados = JSON.parse(localStorage.getItem('pwa_usuarios')) || [];
  
  const user = usuariosGuardados.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    alert('Usuario no registrado. Regístralo desde el Panel de Administración o ingresa como admin@auditoria.com');
    return;
  }

  estadoGlobal.usuarioActual = user;
  
  // 1. Ocultar la pantalla de Login
  document.getElementById('sec-login').classList.add('hidden');
  
  // 2. Mostrar la barra de navegación principal
  document.getElementById('app-nav').classList.remove('hidden');

  document.getElementById('user-info').innerText = `${user.email} (${user.rol} - ${user.tienda})`;
  document.getElementById('lbl-tienda').innerText = user.tienda;

  // 3. Mostrar la pestaña 4. Admin únicamente si el rol es Master
  if (user.rol === 'Master') {
    document.getElementById('btn-nav-admin').classList.remove('hidden');
  } else {
    document.getElementById('btn-nav-admin').classList.add('hidden');
  }

  cambiarModulo('revision');
  renderizarSelectArchivos();
}

function cambiarModulo(modulo) {
  ['sec-carga', 'sec-revision', 'sec-analitica', 'sec-admin'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(`sec-${modulo}`).classList.remove('hidden');

  if (modulo === 'analitica') {
    inicializarAnalitica();
  } else if (modulo === 'admin') {
    inicializarAdmin();
  }
}

function logout() {
  location.reload();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}