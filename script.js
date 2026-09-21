/* ============================================================
   FLORECER INTERIOR · Vizcaína
   JavaScript puro (sin librerías)

   ÍNDICE
   00 · CONFIGURACIÓN EDITABLE  ← lo único que necesitas tocar
   01 · Respaldo de imágenes
   02 · Aparición al hacer scroll
   04 · Scroll suave a los botones
   05 · Galería y lightbox
   06 · Carrusel de testimonios
   07 · Formulario: validación
   08 · Formulario: envío y confirmación
   ============================================================ */

/* ---------- 00 · CONFIGURACIÓN EDITABLE ---------- */

// URL del Google Apps Script publicado como aplicación web.
// Pega la URL /exec de la aplicación web. Sin conexión no se confirma el registro.
const API_URL = "https://script.google.com/macros/s/AKfycbyEH0qARUGzXmXt-nvYtJXSkilLtze5FH8wJC6mK9p-FiboJ5_quHKXacCz7IeZM4Uj/exec";

// Número de WhatsApp proporcionado por la empresa, sin espacios ni signo +.
const WHATSAPP_NUMERO = "5213319571684";

// {nombre} se sustituye por el nombre del registro confirmado.
const WHATSAPP_MENSAJE = "¡Hola! 🌷 Soy {nombre}. Ya me registré en Florecer Interior para concursar por un curso de florería. Me gustaría conocer más detalles del concurso. ¡Gracias!";




/* ---------- 01 · Respaldo de imágenes ----------
   Si una fotografía todavía no existe en /images/, el bloque muestra
   un degradado de la paleta en lugar de un ícono de imagen rota.        */
document.querySelectorAll("img").forEach(img => {
  img.addEventListener("error", () => {
    const contenedor = img.closest(".hero, .galeria__item, .experiencia__figura");
    if (contenedor) contenedor.classList.add("sin-imagen");
  });
  // Si la imagen ya falló antes de que se registrara el evento
  if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event("error"));
});


/* ---------- 02 · Aparición al hacer scroll ---------- */
const elementosReveal = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        obs.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -60px 0px" });

  elementosReveal.forEach(el => observador.observe(el));
} else {
  // Navegadores antiguos: se muestra todo sin animación
  elementosReveal.forEach(el => el.classList.add("visible"));
}


/* ---------- 04 · Scroll suave a los botones ---------- */
document.querySelectorAll("[data-scroll]").forEach(enlace => {
  enlace.addEventListener("click", e => {
    const destino = document.querySelector(enlace.getAttribute("href"));
    if (!destino) return;
    e.preventDefault();
    destino.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


/* ---------- 05 · Galería y lightbox ---------- */
const itemsGaleria = Array.from(document.querySelectorAll(".galeria__item"));
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
let indiceActual = 0;
let ultimoFoco = null;

function abrirLightbox(indice) {
  const img = itemsGaleria[indice].querySelector("img");
  if (!img || !img.naturalWidth) return;          // no abrir si la imagen no cargó

  indiceActual = indice;
  ultimoFoco = document.activeElement;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("abierto"));
  document.body.style.overflow = "hidden";
  document.getElementById("lightboxCerrar").focus();
}

function cerrarLightbox() {
  lightbox.classList.remove("abierto");
  document.body.style.overflow = "";
  setTimeout(() => { lightbox.hidden = true; }, 250);
  if (ultimoFoco) ultimoFoco.focus();
}

function moverLightbox(paso) {
  let i = indiceActual;
  // Avanza hasta encontrar la siguiente imagen que sí cargó
  for (let intentos = 0; intentos < itemsGaleria.length; intentos++) {
    i = (i + paso + itemsGaleria.length) % itemsGaleria.length;
    const img = itemsGaleria[i].querySelector("img");
    if (img && img.naturalWidth) { abrirLightbox(i); return; }
  }
}

itemsGaleria.forEach((item, i) => item.addEventListener("click", () => abrirLightbox(i)));

if (lightbox) {
  document.getElementById("lightboxCerrar").addEventListener("click", cerrarLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", () => moverLightbox(-1));
  document.getElementById("lightboxNext").addEventListener("click", () => moverLightbox(1));

  // Cerrar al tocar el fondo
  lightbox.addEventListener("click", e => { if (e.target === lightbox) cerrarLightbox(); });

  // Teclado: Esc cierra, flechas navegan
  document.addEventListener("keydown", e => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") cerrarLightbox();
    if (e.key === "ArrowLeft") moverLightbox(-1);
    if (e.key === "ArrowRight") moverLightbox(1);
  });
}


/* ---------- 07 · Formulario: validación ---------- */
const formulario = document.getElementById("formulario");
const aviso = document.getElementById("avisoFormulario");

// Formatea el teléfono mientras se escribe: 33 1234 5678
const inputTelefono = document.getElementById("telefono");
if (inputTelefono) {
  inputTelefono.addEventListener("input", () => {
    const d = inputTelefono.value.replace(/\D/g, "").slice(0, 10);
    inputTelefono.value = d.replace(/^(\d{2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" ")
    );
  });
}

// Marca un campo como válido o inválido y muestra el mensaje
function marcar(campo, mensaje) {
  campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
  const contenedor = campo.closest(".campo");
  const error = contenedor.querySelector(".campo__error");
  if (mensaje) {
    contenedor.classList.add("invalido");
    contenedor.classList.remove("valido");
    if (error) error.textContent = mensaje;
    return false;
  }
  contenedor.classList.remove("invalido");
  contenedor.classList.add("valido");
  if (error) error.textContent = "";
  return true;
}

function validarNombre() {
  const c = document.getElementById("nombre");
  const v = c.value.trim();
  if (v.length < 3) return marcar(c, "Escribe tu nombre completo.");
  return marcar(c, "");
}

function validarTelefono() {
  const c = document.getElementById("telefono");
  const d = c.value.replace(/\D/g, "");
  if (d.length !== 10) return marcar(c, "El teléfono debe tener 10 dígitos.");
  return marcar(c, "");
}

function validarCorreo() {
  const c = document.getElementById("correo");
  const v = c.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return marcar(c, "Revisa tu correo, parece incompleto.");
  return marcar(c, "");
}

if (formulario) {
  // Validar al salir de cada campo de texto
  document.getElementById("nombre").addEventListener("blur", validarNombre);
  document.getElementById("telefono").addEventListener("blur", validarTelefono);
  document.getElementById("correo").addEventListener("blur", validarCorreo);

  const validadores = { nombre: validarNombre, telefono: validarTelefono, correo: validarCorreo };
  Object.entries(validadores).forEach(([id, validar]) => {
    const campo = document.getElementById(id);
    campo.addEventListener("input", () => {
      aviso.textContent = "";
      if (campo.closest(".campo").matches(".invalido, .valido")) validar();
    });
  });
}


/* ---------- 08 · Formulario: envío y confirmación ---------- */

// Arma el enlace de WhatsApp de la pantalla de confirmación
const botonWhatsApp = document.getElementById("botonWhatsApp");
if (botonWhatsApp) {
  botonWhatsApp.hidden = !/^\d{10,15}$/.test(WHATSAPP_NUMERO);

}

const whatsappFlotante = document.getElementById("whatsappFlotante");
if (whatsappFlotante) {
  const mensaje = "¡Hola! 🌷 Me gustaría recibir información sobre el concurso Florecer Interior.";
  whatsappFlotante.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

let enviando = false;
let ultimoRegistro = null;

if (formulario) {
  formulario.addEventListener("submit", async e => {
    e.preventDefault();
    if (enviando) return;
    aviso.textContent = "";

    // Campo trampa lleno = envío automatizado, se ignora en silencio
    if (document.getElementById("sitio").value) return;

    const pruebas = [
      validarNombre(),
      validarTelefono(),
      validarCorreo()
    ];

    if (pruebas.includes(false)) {
      const primerError = formulario.querySelector(".invalido");
      if (primerError) {
        primerError.scrollIntoView({ behavior: "smooth", block: "center" });
        const campo = primerError.querySelector("input");
        if (campo && campo.type !== "checkbox" && campo.type !== "radio") campo.focus({ preventScroll: true });
      }
      aviso.textContent = "Revisa los campos marcados para continuar.";
      return;
    }

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(API_URL)) {
      aviso.textContent = "El registro aún no está habilitado. Vuelve a intentarlo más tarde.";
      return;
    }

    // Datos que se enviarán a Google Sheets
    const datos = {
      nombre: document.getElementById("nombre").value.trim(),
      telefono: document.getElementById("telefono").value.replace(/\D/g, ""),
      correo: document.getElementById("correo").value.trim().toLowerCase(),
      sitio: document.getElementById("sitio").value
    };

    const firma = JSON.stringify(datos);
    if (!ultimoRegistro || ultimoRegistro.firma !== firma) {
      ultimoRegistro = { firma, id: crypto.randomUUID() };
    }
    datos.id = ultimoRegistro.id;
    const boton = document.getElementById("botonEnviar");
    enviando = true;
    formulario.setAttribute("aria-busy", "true");
    formulario.querySelectorAll("input").forEach(campo => { campo.disabled = true; });
    boton.disabled = true;
    boton.textContent = "Enviando…";

    const control = new AbortController();
    const limite = setTimeout(() => control.abort(), 25000);
    try {
      const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datos),
        signal: control.signal,
        redirect: "follow",
        credentials: "omit"
      });
      if (!respuesta.ok) throw new Error("Respuesta no válida");
      const resultado = await respuesta.json();
      if (resultado.ok !== true || resultado.id !== datos.id) throw new Error("Guardado no confirmado");

      mostrarConfirmacion(datos.nombre);

      // Evento de conversión para Facebook / Instagram Ads (si el píxel está instalado)
      if (typeof fbq === "function") fbq("track", "Lead");

    } catch (error) {

      boton.disabled = false;
      boton.textContent = "Registrarme para concursar";
      aviso.textContent = "No pudimos confirmar tu registro. Revisa tu conexión y vuelve a enviar; conservamos tus datos para reintentarlo.";
    } finally {
      clearTimeout(limite);
      enviando = false;
      formulario.removeAttribute("aria-busy");
      formulario.querySelectorAll("input").forEach(campo => { campo.disabled = false; });
    }
  });
}

function mostrarConfirmacion(nombre) {
  if (botonWhatsApp) {
    const mensaje = WHATSAPP_MENSAJE.replace("{nombre}", () => nombre.trim());
    botonWhatsApp.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    if (whatsappFlotante) whatsappFlotante.href = botonWhatsApp.href;
  }
  const confirmacion = document.getElementById("confirmacion");
  const primerNombre = nombre.trim().split(/\s+/)[0];
  document.getElementById("confirmacionTitulo").textContent = `¡Gracias, ${primerNombre}! Recibimos tu registro.`;
  formulario.hidden = true;
  document.querySelector(".registro__encabezado").hidden = true;
  confirmacion.hidden = false;
  confirmacion.focus();
  confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Cierre al terminar el 29 de septiembre, hora de Guadalajara (UTC-6).
const CIERRE_CONCURSO = Date.parse("2026-09-30T00:00:00-06:00");
function tiempoRestante(ahora) {
  const total = Math.max(0, Math.ceil((CIERRE_CONCURSO - ahora) / 1000));
  return { dias: Math.floor(total / 86400), horas: Math.floor(total / 3600) % 24,
    minutos: Math.floor(total / 60) % 60, segundos: total % 60, terminado: total === 0 };
}
function actualizarCuenta() {
  const tiempo = tiempoRestante(Date.now());
  for (const [clave, id] of Object.entries({dias:"cuentaDias", horas:"cuentaHoras", minutos:"cuentaMinutos", segundos:"cuentaSegundos"})) {
    document.getElementById(id).textContent = String(tiempo[clave]).padStart(2, "0");
  }
  if (tiempo.terminado) {
    const estado = document.getElementById("contadorEstado");
    const texto = "El plazo de registro ha finalizado. Anuncio de ganadores: 30 de septiembre de 2026.";
    if (estado.textContent !== texto) estado.textContent = texto;
  }
}
actualizarCuenta();
const intervaloCuenta = setInterval(() => {
  actualizarCuenta();
  if (Date.now() >= CIERRE_CONCURSO) clearInterval(intervaloCuenta);
}, 1000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) actualizarCuenta(); });
