// ESTADO GLOBAL DE LA APLICACIÓN
let estadoGlobal = {
  usuarioActual: null, // { email, rol: 'Master' | 'Auditor', tienda: 'Automercado' }
  archivosCargados: [], // Lista de reportes procesados
  archivoActivoIndex: -1,
  productoSeleccionadoIndex: -1
};

// VINCULACIÓN DE TIENDAS Y USUARIOS
const BASE_USUARIOS = [
  { email: 'admin@auditoria.com', rol: 'Master', tienda: 'Todas' },
  { email: 'automercado@auditoria.com', rol: 'Auditor', tienda: 'Automercado' },
  { email: 'limitada@auditoria.com', rol: 'Auditor', tienda: 'Limitada' }
];

function iniciarSesion() {
  const email = document.getElementById('login-email').value.trim();
  const user = BASE_USUARIOS.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    alert('Usuario no registrado. Utiliza admin@auditoria.com o automercado@auditoria.com');
    return;
  }

  estadoGlobal.usuarioActual = user;
  document.getElementById('sec-login').classList.add('hidden');
  document.getElementById('user-info').innerText = `${user.email} (${user.rol} - ${user.tienda})`;
  document.getElementById('lbl-tienda').innerText = user.tienda;

  cambiarModulo('revision');
  renderizarSelectArchivos();
}

function cambiarModulo(modulo) {
  ['sec-carga', 'sec-revision', 'sec-analitica'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(`sec-${modulo}`).classList.remove('hidden');

  if (modulo === 'analitica') {
    inicializarAnalitica();
  }
}

function logout() {
  location.reload();
}

// Registro del Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}