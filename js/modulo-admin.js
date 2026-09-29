// Inicializar datos en almacenamiento local (localStorage) si están vacíos
function cargarBaseDatosLocal() {
  if (!localStorage.getItem('pwa_tiendas')) {
    const tiendasIniciales = ['Automercado', 'Limitada', 'Super Barato'];
    localStorage.setItem('pwa_tiendas', JSON.stringify(tiendasIniciales));
  }

  if (!localStorage.getItem('pwa_usuarios')) {
    const usuariosIniciales = [
      { email: 'admin@auditoria.com', rol: 'Master', tienda: 'Todas' },
      { email: 'automercado@auditoria.com', rol: 'Auditor', tienda: 'Automercado' },
      { email: 'limitada@auditoria.com', rol: 'Auditor', tienda: 'Limitada' }
    ];
    localStorage.setItem('pwa_usuarios', JSON.stringify(usuariosIniciales));
  }
}

// Renderizar las tablas e inputs del Panel de Administración
function inicializarAdmin() {
  cargarBaseDatosLocal();
  renderizarListaTiendasAdmin();
  renderizarListaUsuariosAdmin();
  actualizarSelectTiendasFormUsuario();
}

// 1. GESTIÓN DE TIENDAS
function renderizarListaTiendasAdmin() {
  const tiendas = JSON.parse(localStorage.getItem('pwa_tiendas')) || [];
  const contenedor = document.getElementById('lista-tiendas-admin');
  contenedor.innerHTML = '';

  tiendas.forEach((tienda, index) => {
    const div = document.createElement('div');
    div.className = "flex justify-between items-center bg-gray-50 p-2 rounded border text-xs";
    div.innerHTML = `
      <span class="font-bold text-gray-700">🏪 ${tienda}</span>
      <button onclick="eliminarTienda(${index})" class="text-red-600 font-bold hover:underline">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });
}

function agregarTienda() {
  const input = document.getElementById('input-nueva-tienda');
  const nombre = input.value.trim();

  if (!nombre) return alert('Escribe el nombre de la tienda.');

  let tiendas = JSON.parse(localStorage.getItem('pwa_tiendas')) || [];
  if (tiendas.includes(nombre)) return alert('Esta tienda ya existe.');

  tiendas.push(nombre);
  localStorage.setItem('pwa_tiendas', JSON.stringify(tiendas));

  input.value = '';
  renderizarListaTiendasAdmin();
  actualizarSelectTiendasFormUsuario();
  alert(`¡Tienda "${nombre}" agregada con éxito!`);
}

function eliminarTienda(index) {
  if (!confirm('¿Seguro que deseas eliminar esta tienda?')) return;

  let tiendas = JSON.parse(localStorage.getItem('pwa_tiendas')) || [];
  tiendas.splice(index, 1);
  localStorage.setItem('pwa_tiendas', JSON.stringify(tiendas));

  renderizarListaTiendasAdmin();
  actualizarSelectTiendasFormUsuario();
}

// 2. GESTIÓN DE USUARIOS
function actualizarSelectTiendasFormUsuario() {
  const tiendas = JSON.parse(localStorage.getItem('pwa_tiendas')) || [];
  const select = document.getElementById('select-usuario-tienda');
  select.innerHTML = '<option value="Todas">Todas (Solo Master / Admin)</option>';

  tiendas.forEach(t => {
    select.innerHTML += `<option value="${t}">${t}</option>`;
  });
}

function renderizarListaUsuariosAdmin() {
  const usuarios = JSON.parse(localStorage.getItem('pwa_usuarios')) || [];
  const contenedor = document.getElementById('lista-usuarios-admin');
  contenedor.innerHTML = '';

  usuarios.forEach((usr, index) => {
    const div = document.createElement('div');
    div.className = "flex justify-between items-center bg-gray-50 p-2 rounded border text-xs";
    div.innerHTML = `
      <div>
        <p class="font-bold text-gray-800">👤 ${usr.email}</p>
        <p class="text-[10px] text-gray-500">Rol: ${usr.rol} | Tienda: ${usr.tienda}</p>
      </div>
      ${usr.rol !== 'Master' ? `<button onclick="eliminarUsuario(${index})" class="text-red-600 font-bold hover:underline">Eliminar</button>` : '<span class="text-xs text-blue-600 font-bold">Admin</span>'}
    `;
    contenedor.appendChild(div);
  });
}

function agregarUsuario() {
  const email = document.getElementById('input-usuario-email').value.trim();
  const rol = document.getElementById('select-usuario-rol').value;
  const tienda = document.getElementById('select-usuario-tienda').value;

  if (!email) return alert('Escribe un correo válido.');

  let usuarios = JSON.parse(localStorage.getItem('pwa_usuarios')) || [];
  if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return alert('Este correo ya está registrado.');
  }

  usuarios.push({ email, rol, tienda });
  localStorage.setItem('pwa_usuarios', JSON.stringify(usuarios));

  document.getElementById('input-usuario-email').value = '';
  renderizarListaUsuariosAdmin();
  alert(`¡Usuario "${email}" registrado con éxito!`);
}

function eliminarUsuario(index) {
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

  let usuarios = JSON.parse(localStorage.getItem('pwa_usuarios')) || [];
  usuarios.splice(index, 1);
  localStorage.setItem('pwa_usuarios', JSON.stringify(usuarios));

  renderizarListaUsuariosAdmin();
}