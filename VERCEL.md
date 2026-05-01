# Despliegue en Vercel — Pixel + CAPI

## 1. Estructura de archivos para Vercel

Sube tu repo con esta estructura:

```
/  (raíz del repo)
├── NIIF Inteligente.html       ← cambia el nombre a index.html en producción
├── app.jsx
├── styles.css
├── assets/
│   └── niif-bg.jpg
└── api/
    └── capi.js                 ← serverless function (ya creada)
```

> Tip: renombra `NIIF Inteligente.html` a `index.html` para que cargue en la raíz del dominio.

## 2. Variables de entorno

En el panel de Vercel → tu proyecto → **Settings → Environment Variables**, agrega:

| Nombre | Valor | Entornos |
|---|---|---|
| `META_PIXEL_ID` | `1349103609274064` | Production, Preview, Development |
| `META_CAPI_TOKEN` | tu token CAPI (el `EAACt...`) | Production, Preview, Development |
| `META_TEST_EVENT_CODE` | (opcional, solo para pruebas) | Development |

⚠️ **Rota el token actual** primero en Events Manager → Configuración → Conversions API, porque ya estuvo expuesto en este chat. Genera uno nuevo y úsalo aquí.

## 3. Disparar eventos desde el navegador hacia /api/capi

El pixel del navegador ya manda `PageView` y `InitiateCheckout` automáticamente. Para complementar con CAPI server-side (mejor atribución cuando los navegadores bloquean el pixel), haz un `fetch` paralelo:

```js
async function trackInitiateCheckout() {
  const eventId = crypto.randomUUID();

  // 1. Pixel del navegador (con eventID para dedupe con CAPI)
  if (typeof fbq === "function") {
    fbq("track", "InitiateCheckout", {}, { eventID: eventId });
  }

  // 2. CAPI server-side (mismo event_id → Meta deduplica)
  fetch("/api/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: "InitiateCheckout",
      event_id: eventId,
      event_source_url: location.href,
      // si tienes form con email/teléfono, pásalos aquí — el server los hashea
      // email: "user@x.com",
      // phone: "+57300...",
    }),
  }).catch(() => {});
}
```

## 4. Verificar que funciona

1. **Pixel:** instala la extensión **Meta Pixel Helper** en Chrome → carga tu sitio → debe aparecer `PageView` y al hacer clic en CTA, `InitiateCheckout`.
2. **CAPI:** en Events Manager → Test Events, pega tu `META_TEST_EVENT_CODE` y haz clic en CTAs → debe aparecer el mismo evento marcado como "server".
3. **Deduplicación:** si pixel y CAPI llegan con el mismo `event_id`, Meta los une (ves un solo evento, no doble conteo).

## 5. Próximos pasos opcionales

- Cambiar el `Access-Control-Allow-Origin: *` en `api/capi.js` por tu dominio (`https://tudominio.com`) para que solo tu sitio pueda llamar la función.
- Disparar `Purchase` desde la página de gracias de Hotmart (tendrías que pedirle a Hotmart que redirija a una URL tuya con los datos de la compra).
- Agregar `ViewContent` en secciones específicas del landing si quieres optimizar audiencias.
