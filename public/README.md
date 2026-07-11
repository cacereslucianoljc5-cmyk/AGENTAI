# Logos de HoodAgentAi

Coloca aquí tus imágenes de marca para que la página use los logos reales:

- **`mascot.png`** → el personaje encapuchado neón (el que aparece en el hexágono).
  Se muestra en la cabecera de la web. Recomendado: cuadrado, ~512×512 px.

- (Opcional) El texto **HoodAgent** ya está recreado con CSS neón en la web,
  así que no necesitas subir la imagen del wordmark. Si prefieres usar tu PNG,
  reemplaza el bloque `<div className="wordmark">` en `app/page.tsx` por
  `<img src="/wordmark.png" className="wordmark-img" alt="HoodAgent" />` y
  sube tu archivo como `wordmark.png`.

Si `mascot.png` no existe, la web muestra un hexágono neón de reemplazo
automáticamente (no se rompe nada).
