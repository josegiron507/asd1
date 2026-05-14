// ══════════════════════════════════════════════════════════
//  FORO ESPACIAL  ·  Firebase Firestore  ·  Tiempo real
// ══════════════════════════════════════════════════════════
 
// Referencia a la colección "posts" en Firestore
const db          = firebase.firestore();
const postsRef    = db.collection('foro_posts');
 
 
// ──────────────────────────────────────────────
//  1.  ESCUCHA EN TIEMPO REAL  (onSnapshot)
//      Se dispara al cargar Y cada vez que
//      cualquier usuario añade o borra un post.
// ──────────────────────────────────────────────
 
postsRef
    .orderBy('fecha', 'desc')       // más reciente primero
    .onSnapshot(snapshot => {
        const posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        foroRenderPosts(posts);
    }, error => {
        console.error('Error al escuchar Firestore:', error);
        foroMostrarToast('⚠️ Error de conexión con la base de datos');
    });
 
 
// ──────────────────────────────────────────────
//  2.  TOAST  (notificación flotante)
// ──────────────────────────────────────────────
 
function foroMostrarToast(msg) {
    const t = document.getElementById('foro-toast');
    t.textContent = msg;
    t.classList.add('foro-toast-visible');
    setTimeout(() => t.classList.remove('foro-toast-visible'), 2800);
}
 
 
// ──────────────────────────────────────────────
//  3.  PUBLICAR NUEVO POST
// ──────────────────────────────────────────────
 
async function foroPublicarPost() {
    const autor     = document.getElementById('foro-input-autor').value.trim();
    const titulo    = document.getElementById('foro-input-titulo').value.trim();
    const contenido = document.getElementById('foro-input-contenido').value.trim();
 
    if (!autor)     { foroMostrarToast('⚠️ Escribe tu nombre');  return; }
    if (!titulo)    { foroMostrarToast('⚠️ Escribe un título');   return; }
    if (!contenido) { foroMostrarToast('⚠️ Escribe un mensaje');  return; }
 
    // Deshabilitar botón mientras se guarda
    const btn = document.getElementById('foro-btn-publicar');
    btn.disabled = true;
    btn.textContent = 'Publicando…';
 
    try {
        // Guardar en Firestore  →  onSnapshot actualizará la lista automáticamente
        await postsRef.add({
            autor,
            titulo,
            contenido,
            fecha: firebase.firestore.FieldValue.serverTimestamp()
                   // serverTimestamp garantiza fecha del servidor, no del cliente
        });
 
        // Limpiar campos
        document.getElementById('foro-input-autor').value     = '';
        document.getElementById('foro-input-titulo').value    = '';
        document.getElementById('foro-input-contenido').value = '';
 
        foroMostrarToast('🚀 ¡Publicado con éxito!');
 
    } catch (err) {
        console.error('Error al publicar:', err);
        foroMostrarToast('⚠️ No se pudo publicar. Intenta de nuevo.');
    } finally {
        btn.disabled    = false;
        btn.innerHTML   = '<i class="fa-solid fa-bullhorn"></i> Publicar';
    }
}
 
 
// ──────────────────────────────────────────────
//  4.  ELIMINAR POST
// ──────────────────────────────────────────────
 
async function foroEliminarPost(docId) {
    if (!confirm('¿Eliminar este mensaje?')) return;
 
    try {
        await postsRef.doc(docId).delete();
        foroMostrarToast('🗑️ Mensaje eliminado');
        // onSnapshot ya actualizará la lista
    } catch (err) {
        console.error('Error al eliminar:', err);
        foroMostrarToast('⚠️ No se pudo eliminar. Intenta de nuevo.');
    }
}
 
 
// ──────────────────────────────────────────────
//  5.  RENDERIZAR POSTS EN PANTALLA
// ──────────────────────────────────────────────
 
function foroRenderPosts(posts) {
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
 
        // Firestore usa Timestamp; si aún es null (escritura pendiente), usamos "ahora"
        const fechaObj = p.fecha ? p.fecha.toDate() : new Date();
        const fecha = fechaObj.toLocaleString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
 
        // Escapar HTML para evitar XSS
        const safe = str => String(str)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
 
        return `
        <div class="foro-post-card">
            <div class="foro-post-meta">
                <span class="foro-post-autor">@${safe(p.autor)}</span>
                <span class="foro-post-fecha">${fecha}</span>
            </div>
            <div class="foro-post-titulo">${safe(p.titulo)}</div>
            <div class="foro-post-contenido">${safe(p.contenido)}</div>
            <div class="foro-post-footer">
                <button class="foro-btn-eliminar"
                        onclick="foroEliminarPost('${p.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>`;
    }).join('');
}