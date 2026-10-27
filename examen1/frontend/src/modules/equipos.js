import { request } from "./api.js";

export const listarCategorias = () => request("/categorias");

export const listarEquipos = (pagina = 1, porPagina = 6) => {
  const parametros = new URLSearchParams({ page: pagina, per_page: porPagina });
  return request(`/equipos?${parametros}`);
};

export const crearEquipo = (datos) => {
  return request("/equipos", { method: "POST", body: datos });
};

export const eliminarEquipo = (id) => {
  return request(`/equipos/${id}`, { method: "DELETE" });
};

export const prestarEquipo = (id) => {
  return request(`/equipos/${id}/prestamo`, { method: "POST" });
};
