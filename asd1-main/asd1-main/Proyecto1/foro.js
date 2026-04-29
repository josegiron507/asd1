const FORO_KEY = 'foro_sistemasolar';

// 1 GUARDAR Y CARGAR //

function foroCargarPosts() {
    const data = localStorage.getItem(FORO_KEY);
    return data ? JSON.parse(data) : [];
}

function foroGuardarPosts(posts) {
    localStorage.setItem(FORO_KEY, JSON.stringify(posts));
}

// TOAST (NOTIFICACION) //

function foroMostrarToast(msg) {
    const t = document.getElementById('foro-toast');
    t.textContent = msg;
    t.classList.add('foro-toast-visible');
    setTimeout(() => t.classList.remove('foro-toast-visible'), 2800);
} 


// 2 PUBLICAR NUEVO POST //

function foroPublicarPost() {
    const autor     = document.getElementById('foro-input-autor').value.trim();
    const titulo    = document.getElementById('foro-input-titulo').value.trim();
    const contenido = document.getElementById('foro-input-contenido').value.trim();

    if (!autor)     { foroMostrarToast('⚠️ Escribe tu nombre');  return; }
    if (!titulo)    { foroMostrarToast('⚠️ Escribe un título');   return; }
    if (!contenido) { foroMostrarToast('⚠️ Escribe un mensaje');  return; }

    const posts = foroCargarPosts();
    posts.unshift({
        id: Date.now(),
        autor, 
        titulo, 
        contenido,
        fecha: new Date().toISOString()
    });

    foroGuardarPosts(posts);

    document.getElementById('foro-input-autor').value     = '';
    document.getElementById('foro-input-titulo').value    = '';
    document.getElementById('foro-input-contenido').value = '';

    foroRenderPosts(); //mostrar en pantalla//
    foroMostrarToast('🚀 ¡Publicado con éxito!');
}

//  4 ELIMINAR POST  //

function foroEliminarPost(id) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    foroGuardarPosts(foroCargarPosts().filter(p => p.id !== id));
    foroRenderPosts();
    foroMostrarToast('🗑️ Mensaje eliminado');
}

//  7 MOSTRAR POSTS EN PANTALLA //

function foroRenderPosts() {
    const posts = foroCargarPosts();
    const lista = document.getElementById('foro-posts-lista');

    if (posts.length === 0) {
        lista.innerHTML = `
            <div id="foro-empty-state">
                <div class="foro-empty-icon">🌌</div>
                <p>No hay mensajes aún. ¡Sé el primero en publicar!</p>
            </div>`;
        return;
    }

    lista.innerHTML = posts.map(p => {
        const fecha = new Date(p.fecha).toLocaleString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        return `
        <div class="foro-post-card">
            <div class="foro-post-meta">
                <span class="foro-post-autor">@${p.autor}</span>
                <span class="foro-post-fecha">${fecha}</span>
            </div>
            <div class="foro-post-titulo">${p.titulo}</div>
            <div class="foro-post-contenido">${p.contenido}</div>
            <div class="foro-post-footer">
                <button class="foro-btn-eliminar" onclick="foroEliminarPost(${p.id})">🗑️ Eliminar</button>
            </div>
        </div>`;
    }).join('');
}

// ── INICIO //

foroRenderPosts();