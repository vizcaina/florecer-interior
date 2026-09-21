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
| `flor1.jpg` … `flor3.jpg` | Galería | 900 px de ancho |
| `og-florecer-interior.jpg` | Vista previa al compartir | 1200 × 630 px |

Guárdalas en JPG o WebP por debajo de 300 KB cada una. Mientras no existan, la página muestra degradados de la paleta en su lugar, así que puedes revisarla desde ahora.

## 2. Configuración

Todo lo editable está al inicio de `script.js`:

```js
const API_URL = "PEGAR_URL_APPS_SCRIPT_AQUI";
const WHATSAPP_NUMERO = "52XXXXXXXXXX";   // 52 + 10 dígitos, sin espacios
```

El registro corresponde a un concurso para ganar un curso de florería. No hay un contador de lugares ni una reservación automática.

En `index.html` reemplaza `https://TU-DOMINIO.com/` en las etiquetas `canonical` y Open Graph.

## 3. Conectar con Google Sheets

Sigue [CONECTAR-REGISTROS.md](CONECTAR-REGISTROS.md). Usa el receptor `google-apps-script/Code.gs`, que valida y confirma cada registro. El formulario no guarda datos hasta completar la configuración.

## 4. Meta Ads

El formulario dispara `fbq('track', 'Lead')` al registrarse. Solo falta pegar el código base del píxel en `index.html`, justo antes de `</head>`, y el evento empezará a registrarse solo.


## 5. Publicar

Son archivos estáticos: sirven en Netlify, Vercel, GitHub Pages o cualquier hosting por FTP. Sube la carpeta completa tal cual.
