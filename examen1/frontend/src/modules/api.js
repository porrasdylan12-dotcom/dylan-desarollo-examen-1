import { BASE_URL, TIEMPO_MAXIMO_MS } from "./config.js";
import { ErrorApi } from "./errores.js";
import { obtenerToken, olvidarSesion } from "./auth.js";

export const request = async (ruta, opciones = {}) => {
  const { body, headers: headersOpciones = {}, ...opcionesFetch } = opciones;
  const headers = new Headers(headersOpciones);
  headers.set("Accept", "application/json");

  const token = obtenerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const cuerpoEsObjeto = body !== undefined && body !== null && typeof body === "object";
  if (cuerpoEsObjeto) {
    headers.set("Content-Type", "application/json");
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const response = await fetch(`${BASE_URL}${ruta}`, {
      ...opcionesFetch,
      headers,
      signal: controlador.signal,
      ...(body === undefined ? {} : { body: cuerpoEsObjeto ? JSON.stringify(body) : body }),
    });

    if (response.status === 204) return null;

    const cuerpoJson = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        olvidarSesion();
        window.location.reload();
      }
      throw new ErrorApi(response.status, cuerpoJson);
    }

    return cuerpoJson;
  } finally {
    clearTimeout(temporizador);
  }
};
