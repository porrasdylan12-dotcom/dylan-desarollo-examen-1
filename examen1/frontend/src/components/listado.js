import { listarEquipos, eliminarEquipo } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const POR_PAGINA = 6;

const $lista = document.querySelector("#lista-equipos");
const $plantilla = document.querySelector("#tpl-equipo");
const $resumen = document.querySelector("#resumen");
const $paginaActual = document.querySelector("#pagina-actual");
const $btnAnterior = document.querySelector("#btn-anterior");
const $btnSiguiente = document.querySelector("#btn-siguiente");

let paginaActual = 1;

export const formatearFecha = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });

export const cargarPagina = async (pagina = 1) => {
  $lista.setAttribute("aria-busy", "true");
  try {
    const respuesta = await listarEquipos(pagina, POR_PAGINA);
    const { data, meta } = respuesta;
    paginaActual = meta.current_page;
    $lista.replaceChildren();

    if (data.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "No hay equipos registrados.";
      $lista.append(vacio);
    } else {
      for (const equipo of data) {
        const fragmento = $plantilla.content.cloneNode(true);
        const $tarjeta = fragmento.querySelector("li");
        $tarjeta.dataset.id = equipo.id;
        fragmento.querySelector(".codigo").textContent = equipo.codigo;
        fragmento.querySelector(".nombre").textContent = equipo.nombre;
        fragmento.querySelector(".categoria").textContent = equipo.categoria?.nombre ?? "Sin categoría";
        fragmento.querySelector(".fecha").textContent = formatearFecha(equipo.fecha_adquisicion);
        const $estado = fragmento.querySelector(".estado");
        $estado.textContent = equipo.estado;
        $estado.dataset.estado = equipo.estado;
        $lista.append(fragmento);
      }
    }

    $resumen.textContent = meta.total === 0
      ? "Mostrando 0 de 0"
      : `Mostrando ${meta.from}–${meta.to} de ${meta.total}`;
    $paginaActual.textContent = `Página ${meta.current_page} de ${meta.last_page}`;
    $btnAnterior.disabled = meta.current_page <= 1;
    $btnSiguiente.disabled = meta.current_page >= meta.last_page;
  } catch (error) {
    mostrarMensaje("error", error.message || "No fue posible cargar los equipos.");
  } finally {
    $lista.setAttribute("aria-busy", "false");
  }
};

const alHacerClicEnLista = async (evento) => {
  const boton = evento.target.closest(".btn-eliminar");
  if (!boton || !$lista.contains(boton)) return;

  const tarjeta = boton.closest("[data-id]");
  if (!tarjeta || !confirm("¿Desea eliminar este equipo?")) return;

  try {
    await eliminarEquipo(tarjeta.dataset.id);
    mostrarMensaje("exito", "Equipo eliminado.");
    const pagina = $lista.querySelectorAll(".tarjeta").length === 1 && paginaActual > 1
      ? paginaActual - 1
      : paginaActual;
    await cargarPagina(pagina);
  } catch (error) {
    if (error.status === 409) {
      mostrarMensaje("error", error.datos.mensaje);
    } else {
      mostrarMensaje("error", "No fue posible eliminar el equipo.");
    }
  }
};

export const iniciarListado = () => {
  $lista.addEventListener("click", alHacerClicEnLista);

  $btnAnterior.addEventListener("click", () => cargarPagina(paginaActual - 1));
  $btnSiguiente.addEventListener("click", () => cargarPagina(paginaActual + 1));

  cargarPagina(1);
};
