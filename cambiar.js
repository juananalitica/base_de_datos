//<!-- Asegúrate de tener inputs con estos IDs en tu formulario:
//<input type="hidden" id="id_prestamo" />
//<input id="id_usuario" />
//<input id="isbn" />
//<input type="date" id="fecha_prestamo" />
//<input type="date" id="fecha_devolucion" />
//<select id="estado">...</select>
//Y una tabla con <tbody id="tablaPrestamos"></tbody>
//-->
/***** main.js (plantilla adaptable) *****/

// ======================================================
// 1) Configuración base
// ======================================================

// 🔧 CAMBIA AQUÍ si tu endpoint o recurso es diferente
// Ejemplos:
// - JSON Server:  http://localhost:3000/prestamos
// - API propia:   http://localhost:3000/api/v1/prestamos
// - Otro recurso: http://localhost:3000/payment-allocations
const API_URL = "http://localhost:3000/prestamos";

// 🔧 CAMBIA AQUÍ si cambiaste el nombre de la PK en tu API
// (Por defecto se usa "id_prestamo")
const ID_FIELD = "id_prestamo";

// 🔧 CAMBIA AQUÍ los nombres EXACTOS de las propiedades que devuelve tu API
// para pintar la tabla (las columnas visibles).
// Si tu API no trae 'usuario' y 'libro' (trae id_usuario / isbn), cambia por los que tengas.
const DISPLAY_FIELDS = {
  id: "id_prestamo",
  usuario: "usuario",      // ej. "Juan Pérez"  (si no lo tienes, usa "id_usuario" o quita la columna)
  libro: "libro",          // ej. "El Quijote"  (si no lo tienes, usa "isbn" o quita la columna)
  fecha_prestamo: "fecha_prestamo",
  fecha_devolucion: "fecha_devolucion",
  estado: "estado",
};

// 🔧 CAMBIA AQUÍ los IDs de los inputs en tu HTML y el nombre esperado por la API
const FORM_BINDINGS = {
  hiddenIdInput: "id_prestamo",   // input hidden para la PK
  // Mapea: { inputIdEnHTML : nombreCampoQueEsperaTuAPI }
  fields: {
    id_usuario: "id_usuario",
    isbn: "isbn",
    fecha_prestamo: "fecha_prestamo",
    fecha_devolucion: "fecha_devolucion",
    estado: "estado",
  },
};

// ======================================================
// 2) Referencias al DOM
// ======================================================
const tablaPrestamos = document.getElementById("tablaPrestamos");
const prestamoForm = document.getElementById("prestamoForm");

// Helpers para inputs
const $ = (id) => document.getElementById(id);

// ======================================================
// 3) Utilidades
// ======================================================
function toDateInputValue(value) {
  // Adapta fechas al formato YYYY-MM-DD para inputs type="date"
  if (!value) return "";
  // Soporta "2025-08-01", "2025-08-01T00:00:00Z" o Date
  try {
    if (value instanceof Date) {
      const d = value;
      return d.toISOString().split("T")[0];
    }
    if (typeof value === "string") {
      return value.includes("T") ? value.split("T")[0] : value;
    }
    return "";
  } catch {
    return "";
  }
}

async function http(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${res.statusText}: ${text}`);
  }
  // Si es 204 No Content, evita .json()
  return res.status === 204 ? null : res.json();
}

// ======================================================
// 4) Cargar lista (READ - GET)
// ======================================================
async function cargarPrestamos() {
  try {
    const data = await http(API_URL);

    tablaPrestamos.innerHTML = "";

    data.forEach((p) => {
      // 🔧 Si no tienes usuario/libro “bonitos”, cambia por tus campos
      //    o elimina esas celdas (ver DISPLAY_FIELDS arriba).
      const id = p[DISPLAY_FIELDS.id];
      const usuario = p[DISPLAY_FIELDS.usuario] ?? p["id_usuario"] ?? "";
      const libro = p[DISPLAY_FIELDS.libro] ?? p["isbn"] ?? "";
      const fPrestamo = p[DISPLAY_FIELDS.fecha_prestamo] ?? "";
      const fDevolucion = p[DISPLAY_FIELDS.fecha_devolucion] ?? "";
      const estado = p[DISPLAY_FIELDS.estado] ?? "";

      tablaPrestamos.innerHTML += `
        <tr>
          <td>${id ?? ""}</td>
          <td>${usuario ?? ""}</td>
          <td>${libro ?? ""}</td>
          <td>${toDateInputValue(fPrestamo)}</td>
          <td>${toDateInputValue(fDevolucion)}</td>
          <td>${estado ?? ""}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarPrestamo(${id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarPrestamo(${id})">Eliminar</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    alert("Error al cargar la lista de préstamos. Revisa la consola.");
  }
}

// ======================================================
// 5) Guardar / Actualizar (CREATE - POST / UPDATE - PUT)
// ======================================================
prestamoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // Construir el payload conforme lo espera tu API
    const payload = {};
    for (const [inputId, apiField] of Object.entries(FORM_BINDINGS.fields)) {
      payload[apiField] = $(inputId).value || null;
    }

    const idValue = $(FORM_BINDINGS.hiddenIdInput)?.value;

    if (idValue) {
      // UPDATE
      // 🔧 Si tu API usa PATCH en vez de PUT, cambia "method"
      await http(`${API_URL}/${idValue}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // CREATE
      await http(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    prestamoForm.reset();
    // Limpia el hidden por si acaso
    if ($(FORM_BINDINGS.hiddenIdInput)) $(FORM_BINDINGS.hiddenIdInput).value = "";
    await cargarPrestamos();
  } catch (err) {
    console.error(err);
    alert("Error al guardar el préstamo. Revisa la consola.");
  }
});

// ======================================================
// 6) Editar (READ one - GET /:id)
// ======================================================
window.editarPrestamo = async (id) => {
  try {
    const p = await http(`${API_URL}/${id}`);

    // 🔧 Asegúrate de mapear correctamente según los campos de tu API
    if ($(FORM_BINDINGS.hiddenIdInput)) $(FORM_BINDINGS.hiddenIdInput).value = p[ID_FIELD];

    for (const [inputId, apiField] of Object.entries(FORM_BINDINGS.fields)) {
      if (!$(inputId)) continue;

      if (["fecha_prestamo", "fecha_devolucion"].includes(apiField)) {
        $(inputId).value = toDateInputValue(p[apiField]);
      } else {
        $(inputId).value = p[apiField] ?? "";
      }
    }
  } catch (err) {
    console.error(err);
    alert("Error al cargar el préstamo para edición. Revisa la consola.");
  }
};

// ======================================================
// 7) Eliminar (DELETE /:id)
// ======================================================
window.eliminarPrestamo = async (id) => {
  if (!confirm("¿Seguro que quieres eliminar este préstamo?")) return;

  try {
    await http(`${API_URL}/${id}`, { method: "DELETE" });
    await cargarPrestamos();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar el préstamo. Revisa la consola.");
  }
};

// ======================================================
// 8) Inicializar
// ======================================================
cargarPrestamos();


