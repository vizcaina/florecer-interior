# Florecer Interior · Guía rápida

## Archivos

```
index.html
style.css
script.js
images/        ← aquí van tus fotografías
```

## 1. Fotografías

Coloca en `/images/` con estos nombres exactos:

| Archivo | Uso | Tamaño sugerido |
|---|---|---|
| `hero.jpg` | Pantalla inicial | 1600 × 2000 px |
| `flor1.jpg` … `flor9.jpg` | Galería | 900 px de ancho |
| `experiencia.jpg` | Sección editorial | 1200 × 1500 px |
| `og-florecer-interior.jpg` | Vista previa al compartir | 1200 × 630 px |

Guárdalas en JPG o WebP por debajo de 300 KB cada una. Mientras no existan, la página muestra degradados de la paleta en su lugar, así que puedes revisarla desde ahora.

## 2. Configuración

Todo lo editable está al inicio de `script.js`:

```js
const API_URL = "PEGAR_URL_APPS_SCRIPT_AQUI";
const WHATSAPP_NUMERO = "52XXXXXXXXXX";   // 52 + 10 dígitos, sin espacios
const LUGARES_DISPONIBLES = 18;
const CUPO_TOTAL = 25;
```

Para actualizar el contador basta cambiar `LUGARES_DISPONIBLES` y volver a subir el archivo.

En `index.html` reemplaza `https://TU-DOMINIO.com/` en las etiquetas `canonical` y Open Graph.

## 3. Conectar con Google Sheets

1. Crea una hoja de cálculo nueva. En la primera fila escribe los encabezados:
   `fecha · nombre · telefono · correo · interes · curso · contacto · origen`
2. Menú **Extensiones → Apps Script** y pega:

```js
function doPost(e) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const d = JSON.parse(e.postData.contents);
  hoja.appendRow([
    new Date(), d.nombre, "'" + d.telefono, d.correo,
    d.interes, d.curso, d.contacto, d.origen
  ]);
  return ContentService.createTextOutput("ok");
}
```

3. **Implementar → Nueva implementación → Aplicación web.**
   Ejecutar como: *Yo*. Con acceso: *Cualquier usuario*.
4. Copia la URL que termina en `/exec` y pégala en `API_URL`.

El apóstrofo antes del teléfono evita que Sheets borre el cero inicial.

## 4. Meta Ads

El formulario dispara `fbq('track', 'Lead')` al registrarse. Solo falta pegar el código base del píxel en `index.html`, justo antes de `</head>`, y el evento empezará a registrarse solo.

El campo `origen` guarda la URL completa, así que si etiquetas tus anuncios con UTM (`?utm_campaign=florecer-octubre`) podrás saber qué anuncio trajo cada registro.

## 5. Publicar

Son archivos estáticos: sirven en Netlify, Vercel, GitHub Pages o cualquier hosting por FTP. Sube la carpeta completa tal cual.
