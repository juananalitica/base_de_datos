/************************************************************
 * main.template.js — CRUD genérico para una tabla/colección
 * Adáptalo con los TODO marcados abajo.
 ************************************************************/

// ================== CONFIGURACIÓN ================== //
// TODO(1): Cambia baseURL y resource según tu API/JSON-Server/Backend
const CONFIG = {
  baseURL: "http://localhost:3000",     // p.ej. "https://miapi.com" o "http://localhost:3000"
  resource: "prestamos",                // p.ej. "prestamos" o "payment_allocations"

  // TODO(2): Cambia el nombre de la PK si tu backend usa otro (ej: "id" o "_id")
  primaryKey: "id_prestamo",

  // TODO(3): Cambia IDs de elementos HTML reales de tu página
  formId: "prestamoForm",
  tableBodyId: "tablaPrestamos",

  // TODO(4): Mapea los campos del formulario a las llaves del backend
  // key: nombre del campo en tu backend
  // input: id del <input/select> en tu HTML
  // type: "date" si es input type="date" (formato YYYY-MM-DD)
  fields: [
    { key: "id_usuario",       input: "id_usuario" },
    { key: "isbn",             input: "isbn" },
    { key: "fecha_prestamo",   input: "fecha_prestamo",   type: "date" },
    { key: "fecha_devolucion", input: "fecha_devolucion", type: "date", nullable: true },
    { key: "estado",           input: "estado" },
  ],

  // TODO(5): Define las columnas a mostrar en la tabla.
  // Deben existir en el objeto que devuelve el backend.
  // Si tu backend NO devuelve "usuario" y "libro" ya resueltos,
  // usa "id_usuario" e "isbn" aquí en vez de "usuario"/"libro".
  columnsToShow: [
    "id_prestamo",
    // "usuario",  // usa esto si tu backend trae el nombre ya resuelto
    // "libro",    // idem
    "id_usuario",
    "isbn",
    "fecha_prestamo",
    "fecha_devolucion",
    "estado",
  ],
};
// =================================================== //

const API_URL = `${CONFIG.baseURL}/${CONFIG.resource}`;

const $form = document.getElementById(CONFIG.formId);
const $tbody = document.getElementById(CONFIG.tableBodyId);

// Helpers de fechas
function toInputDate(value) {
  if (!value) return "";                      // soporta null/undefined
  if (typeof value !== "string") return value;
  // Acepta "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ssZ"
  return value.includes("T") ? value.split("T")[0] : value;
}

function fromInputDate(value) {
  // Mantén "YYYY-MM-DD" salvo que tu backend requiera formato ISO completo
  return value || null;
}

// Render de una fila
function renderRow(item) {
  const cells = CONFIG.columnsToShow.map(col => `<td>${item[col] ?? ""}</td>`).join("");
  const id = item[CONFIG.primaryKey];
  return `
    <tr>
      ${cells}
      <td class="text-nowrap">
        <button class="btn btn-warning btn-sm" onclick="editarRegistro(${JSON.stringify(id)})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${JSON.stringify(id)})">Eliminar</button>
      </td>
    </tr>
  `;
}

// Cargar lista
async function cargarLista() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Error cargando lista: ${res.status}`);
    const data = await res.json();
    $tbody.innerHTML = data.map(renderRow).join("");
  } catch (err) {
    console.error(err);
    $tbody.innerHTML = `<tr><td colspan="${CONFIG.columnsToShow.length + 1}">Error al cargar datos</td></tr>`;
  }
}

// Tomar datos del form → objeto para backend
function getFormData() {
  const obj = {};
  for (const f of CONFIG.fields) {
    const el = document.getElementById(f.input);
    let val = el ? el.value : null;
    if (f.type === "date") val = fromInputDate(val);
    if (!val && f.nullable) val = null; // permite null cuando corresponda
    obj[f.key] = val;
  }
  return obj;
}

// Colocar datos en el form desde un objeto del backend
function setFormData(item) {
  // PK (oculto)
  const pkEl = document.getElementById(CONFIG.primaryKey);
  if (pkEl) pkEl.value = item[CONFIG.primaryKey] ?? "";

  for (const f of CONFIG.fields) {
    const el = document.getElementById(f.input);
    if (!el) continue;
    let val = item[f.key] ?? "";
    if (f.type === "date") val = toInputDate(val);
    el.value = val ?? "";
  }
}

// Crear o actualizar
$form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = getFormData();

  // Si existe un input hidden con la PK, lo usamos para decidir PUT vs POST
  const pkEl = document.getElementById(CONFIG.primaryKey);
  const id = pkEl?.value?.trim();

  try {
    if (id) {
      // UPDATE
      const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error actualizando (${res.status})`);
    } else {
      // CREATE
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error creando (${res.status})`);
    }

    $form.reset();
    if (pkEl) pkEl.value = "";
    await cargarLista();
  } catch (err) {
    console.error(err);
    alert("Hubo un problema guardando el registro.");
  }
});

// Exponer funciones para los botones
window.editarRegistro = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`No se pudo obtener el registro (${res.status})`);
    const item = await res.json();
    setFormData(item);
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar el registro para edición.");
  }
};

window.eliminarRegistro = async (id) => {
  if (!confirm("¿Seguro que quieres eliminar este registro?")) return;
  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Error eliminando (${res.status})`);
    await cargarLista();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar el registro.");
  }
};

// Inicializar
cargarLista();
