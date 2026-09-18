/* ============================================================
   FLORECER INTERIOR · Vizcaína
   JavaScript puro (sin librerías)

   ÍNDICE
   00 · CONFIGURACIÓN EDITABLE  ← lo único que necesitas tocar
   01 · Respaldo de imágenes
   02 · Aparición al hacer scroll
   03 · Contador de lugares
   04 · Scroll suave a los botones
   05 · Galería y lightbox
   06 · Carrusel de testimonios
   07 · Formulario: validación
   08 · Formulario: envío y confirmación
   ============================================================ */

/* ---------- 00 · CONFIGURACIÓN EDITABLE ---------- */

// URL del Google Apps Script publicado como aplicación web.
// Mientras diga "PEGAR_URL_APPS_SCRIPT_AQUI" el formulario funciona en modo
// demostración: valida, muestra la confirmación, pero no guarda nada.
const API_URL = "PEGAR_URL_APPS_SCRIPT_AQUI";

// Número de WhatsApp en formato internacional, sólo dígitos (52 + 10 dígitos).
const WHATSAPP_NUMERO = "52XXXXXXXXXX";

// Mensaje precargado del botón de WhatsApp.
const WHATSAPP_MENSAJE = "Hola, me registré en el evento Florecer Interior y me gustaría recibir más información.";

// Lugares que quedan disponibles y cupo total del evento.
const LUGARES_DISPONIBLES = 18;
const CUPO_TOTAL = 25;

// Velocidad del carrusel de testimonios, en milisegundos.
const TESTIMONIOS_INTERVALO = 6000;


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


/* ---------- 03 · Contador de lugares ---------- */
const contador = document.getElementById("contadorLugares");
const petalosCaja = document.getElementById("petalosCupo");

if (contador) {
  contador.textContent = LUGARES_DISPONIBLES === 1
    ? "Queda 1 lugar disponible"
    : `Quedan ${LUGARES_DISPONIBLES} lugares disponibles`;
}

if (petalosCaja) {
  // Un pétalo por lugar: los llenos son los que siguen disponibles
  for (let i = 0; i < CUPO_TOTAL; i++) {
    const petalo = document.createElement("span");
    petalo.className = "petalo" + (i < LUGARES_DISPONIBLES ? " petalo--lleno" : "");
    petalosCaja.appendChild(petalo);
  }

  // Los pétalos aparecen uno a uno cuando la tarjeta entra en pantalla
  if ("IntersectionObserver" in window) {
    const obsPetalos = new IntersectionObserver((entradas, obs) => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;
        petalosCaja.querySelectorAll(".petalo").forEach((p, i) => {
          setTimeout(() => p.classList.add("petalo--visible"), i * 45);
        });
        obs.disconnect();
      });
    }, { threshold: 0.4 });
    obsPetalos.observe(petalosCaja);
  } else {
    petalosCaja.querySelectorAll(".petalo").forEach(p => p.classList.add("petalo--visible"));
  }
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


/* ---------- 06 · Carrusel de testimonios ---------- */
const pista = document.getElementById("carruselPista");
const carrusel = document.getElementById("carrusel");
const puntosCaja = document.getElementById("carruselPuntos");

if (pista && carrusel) {
  const laminas = Array.from(pista.children);
  let indice = 0;
  let temporizador = null;

  // Puntos de navegación
  laminas.forEach((_, i) => {
    const punto = document.createElement("button");
    punto.type = "button";
    punto.className = "carrusel__punto";
    punto.setAttribute("role", "tab");
    punto.setAttribute("aria-label", `Testimonio ${i + 1}`);
    punto.addEventListener("click", () => { ir(i); reiniciar(); });
    puntosCaja.appendChild(punto);
  });
  const puntos = Array.from(puntosCaja.children);

  function ir(n) {
    indice = (n + laminas.length) % laminas.length;
    pista.style.transform = `translateX(-${indice * 100}%)`;
    puntos.forEach((p, i) => p.setAttribute("aria-selected", i === indice));
    laminas.forEach((l, i) => l.setAttribute("aria-hidden", i !== indice));
  }

  function reiniciar() {
    clearInterval(temporizador);
    // Respeta la preferencia de movimiento reducido
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    temporizador = setInterval(() => ir(indice + 1), TESTIMONIOS_INTERVALO);
  }

  ir(0);
  reiniciar();

  // Pausar mientras se interactúa
  carrusel.addEventListener("mouseenter", () => clearInterval(temporizador));
  carrusel.addEventListener("mouseleave", reiniciar);
  carrusel.addEventListener("focusin", () => clearInterval(temporizador));
  carrusel.addEventListener("focusout", reiniciar);

  // Swipe en celular
  let inicioX = 0, deltaX = 0, arrastrando = false;

  pista.addEventListener("touchstart", e => {
    inicioX = e.touches[0].clientX;
    deltaX = 0;
    arrastrando = true;
    pista.classList.add("arrastrando");
    clearInterval(temporizador);
  }, { passive: true });

  pista.addEventListener("touchmove", e => {
    if (!arrastrando) return;
    deltaX = e.touches[0].clientX - inicioX;
    const porcentaje = (deltaX / carrusel.offsetWidth) * 100;
    pista.style.transform = `translateX(calc(-${indice * 100}% + ${porcentaje}%))`;
  }, { passive: true });

  pista.addEventListener("touchend", () => {
    arrastrando = false;
    pista.classList.remove("arrastrando");
    if (Math.abs(deltaX) > carrusel.offsetWidth * 0.18) {
      ir(deltaX < 0 ? indice + 1 : indice - 1);
    } else {
      ir(indice);
    }
    reiniciar();
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

function validarGrupo(nombre, mensaje) {
  const entradas = formulario.querySelectorAll(`[name="${nombre}"]`);
  const grupo = entradas[0].closest(".campo");
  const error = document.getElementById("error-" + nombre);
  const elegido = Array.from(entradas).some(e => e.checked);

  grupo.classList.toggle("invalido", !elegido);
  if (error) error.textContent = elegido ? "" : mensaje;
  return elegido;
}

if (formulario) {
  // Validar al salir de cada campo de texto
  document.getElementById("nombre").addEventListener("blur", validarNombre);
  document.getElementById("telefono").addEventListener("blur", validarTelefono);
  document.getElementById("correo").addEventListener("blur", validarCorreo);

  // Limpiar el error en cuanto la persona corrige
  formulario.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      const grupo = input.closest(".campo");
      if (grupo && grupo.classList.contains("invalido") && input.type !== "text") {
        grupo.classList.remove("invalido");
        const err = grupo.querySelector(".campo__error");
        if (err) err.textContent = "";
      }
    });
  });
}


/* ---------- 08 · Formulario: envío y confirmación ---------- */

// Arma el enlace de WhatsApp de la pantalla de confirmación
const botonWhatsApp = document.getElementById("botonWhatsApp");
if (botonWhatsApp) {
  botonWhatsApp.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`;
}

if (formulario) {
  formulario.addEventListener("submit", async e => {
    e.preventDefault();
    aviso.textContent = "";

    // Campo trampa lleno = envío automatizado, se ignora en silencio
    if (document.getElementById("sitio").value) return;

    const pruebas = [
      validarNombre(),
      validarTelefono(),
      validarCorreo(),
      validarGrupo("interes", "Elige al menos una opción."),
      validarGrupo("curso", "Elige una opción."),
      validarGrupo("contacto", "Elige cómo prefieres recibir tu descuento.")
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

    // Datos que se enviarán a Google Sheets
    const datos = {
      fecha: new Date().toISOString(),
      nombre: document.getElementById("nombre").value.trim(),
      telefono: document.getElementById("telefono").value.replace(/\D/g, ""),
      correo: document.getElementById("correo").value.trim().toLowerCase(),
      interes: Array.from(formulario.querySelectorAll('[name="interes"]:checked')).map(i => i.value).join(", "),
      curso: (formulario.querySelector('[name="curso"]:checked') || {}).value || "",
      contacto: (formulario.querySelector('[name="contacto"]:checked') || {}).value || "",
      origen: window.location.href    // útil para identificar la campaña de Meta Ads
    };

    const boton = document.getElementById("botonEnviar");
    boton.disabled = true;
    boton.textContent = "Enviando…";

    try {
      if (API_URL && API_URL !== "PEGAR_URL_APPS_SCRIPT_AQUI") {
        // text/plain evita la petición previa CORS que bloquea a Apps Script
        await fetch(API_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(datos)
        });
      } else {
        // Modo demostración mientras no se conecta la hoja de cálculo
        console.info("Modo demostración · datos del registro:", datos);
        await new Promise(r => setTimeout(r, 700));
      }

      mostrarConfirmacion();

      // Evento de conversión para Facebook / Instagram Ads (si el píxel está instalado)
      if (typeof fbq === "function") fbq("track", "Lead");

    } catch (error) {
      console.error(error);
      boton.disabled = false;
      boton.textContent = "Enviar mi registro";
      aviso.textContent = "No pudimos enviar tu registro. Revisa tu conexión e inténtalo otra vez.";
    }
  });
}

function mostrarConfirmacion() {
  const confirmacion = document.getElementById("confirmacion");
  formulario.hidden = true;
  document.querySelector(".registro__encabezado").hidden = true;
  confirmacion.hidden = false;
  confirmacion.focus();
  confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
}
