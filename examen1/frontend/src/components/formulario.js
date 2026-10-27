import { crearEquipo, listarCategorias } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const $form = document.querySelector("#form-equipo");
const $selectCategoria = document.querySelector("#categoria_id");
const $btnGuardar = document.querySelector("#btn-guardar");

export const iniciarFormulario = ({ alGuardar }) => {
  listarCategorias()
    .then(({ data }) => {
      for (const categoria of data) {
        const opcion = document.createElement("option");
        opcion.value = categoria.id;
        opcion.textContent = categoria.nombre;
        $selectCategoria.append(opcion);
      }
    })
    .catch((error) => mostrarMensaje("error", error.message || "No fue posible cargar las categorías."));

  $form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    $form.querySelectorAll("[data-error]").forEach(($p) => ($p.textContent = ""));
    $form.querySelectorAll("[aria-invalid]").forEach(($campo) => $campo.removeAttribute("aria-invalid"));

    const formulario = new FormData($form);
    const datos = Object.fromEntries(formulario.entries());
    datos.categoria_id = datos.categoria_id === "" ? null : Number(datos.categoria_id);
    datos.costo_interno = datos.costo_interno === "" ? null : Number(datos.costo_interno);

    const textoOriginal = $btnGuardar.textContent;
    $btnGuardar.disabled = true;
    $btnGuardar.textContent = "Guardando...";

    try {
      const respuesta = await crearEquipo(datos);
      $form.reset();
      mostrarMensaje("exito", `Equipo ${respuesta.data.codigo} registrado.`);
      alGuardar();
    } catch (error) {
      if (error.status === 422) {
        for (const [campo, mensajes] of Object.entries(error.datos.errors ?? {})) {
          const $error = $form.querySelector(`[data-error="${campo}"]`);
          const $campo = $form.elements.namedItem(campo);
          if ($error) $error.textContent = mensajes[0];
          if ($campo) $campo.setAttribute("aria-invalid", "true");
        }
      } else {
        mostrarMensaje("error", error.message || "No fue posible registrar el equipo.");
      }
    } finally {
      $btnGuardar.disabled = false;
      $btnGuardar.textContent = textoOriginal;
    }
  });
};
