Sistema de Gestión de Biblioteca
Sistema monolítico para administrar usuarios, libros y préstamos.
Backend en Node.js + Express, base de datos MySQL, y frontend simple (Vite) en la carpeta app.

🚀 Tecnologías utilizadas
Node.js, Express.js

MySQL (InnoDB)

HTML, CSS, JavaScript (Frontend con Vite)

csv-parser (carga de datos desde CSV)

(Opcional) Postman para pruebas de API

📁 Estructura del proyecto
bash
Copiar
Editar
biblioteca/
├── docs/                 # Documentación (diagramas, notas técnicas)
├── app/                  # Frontend (Vite: HTML/CSS/JS)
│   ├── index.html
│   └── src/...
├── server/               # Backend (Node/Express)
│   ├── index.js
│   ├── db/               # Conexión y utilidades DB
│   ├── routes/           # Rutas REST
│   ├── controllers/      # Controladores CRUD
│   ├── services/         # Lógica de negocio
│   ├── middlewares/      # Validaciones, errores, CORS, etc.
│   └── scripts/          # (Opcional) scripts CLI p/carga CSV
├── db/ddl/               # Scripts SQL (creación/esquema/seed)
├── db/csv/               # Archivos CSV de carga (usuarios/libros/prestamos)
├── .env                  # Variables de entorno
├── .gitignore
├── index.html            # (Landing / redirección)
└── README.md
🗄️ Modelo de datos (resumen)
Tablas principales (nombres y campos clave):

usuarios

id_usuario (PK auto), nombre, identificacion (UNIQUE), correo, telefono

created_at, updated_at

libros

isbn (PK), titulo, anio_de_publicacion, autor

created_at, updated_at

prestamos

id_prestamo (PK auto)

id_usuario (FK → usuarios.id_usuario ON UPDATE CASCADE ON DELETE SET NULL)

isbn (FK → libros.isbn ON UPDATE CASCADE ON DELETE SET NULL)

fecha_prestamo (NOT NULL), fecha_devolucion (NULL)

estado ENUM('entregado','retrasado','activo')

created_at, updated_at

Diagrama (Mermaid)
Solo informativo; no es código ejecutable SQL.

mermaid
Copiar
Editar
erDiagram
  USUARIOS {
    INT id_usuario PK
    VARCHAR nombre
    VARCHAR identificacion UNIQUE
    VARCHAR correo
    VARCHAR telefono
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  LIBROS {
    VARCHAR isbn PK
    VARCHAR titulo
    YEAR anio_de_publicacion
    VARCHAR autor
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  PRESTAMOS {
    INT id_prestamo PK
    INT id_usuario FK
    VARCHAR isbn FK
    DATE fecha_prestamo
    DATE fecha_devolucion
    ENUM estado
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  USUARIOS ||--o{ PRESTAMOS : "realiza"
  LIBROS ||--o{ PRESTAMOS : "se presta"
✅ Requisitos previos
Node.js 18+

MySQL 8+ (acceso local con usuario que tenga permisos de CREATE/ALTER/INSERT)

Git (opcional)

Postman (opcional para probar APIs)

📦 Instalación
Clonar el repositorio

bash
Copiar
Editar
git clone https://github.com/jcomte23/biblioteca-easy.git
cd biblioteca
Instalar dependencias

bash
Copiar
Editar
npm install
Configurar variables de entorno (.env en la raíz)

env
Copiar
Editar
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=biblioteca_easy
DB_PORT=3306

# Servidor
SERVER_PORT=3000
CORS_ORIGIN=http://localhost:5173
Crear base de datos y tablas

Recomendado: coloca tu script en db/ddl/01_schema.sql

Ejecuta el script desde tu cliente MySQL o consola:

bash
Copiar
Editar
# Ejemplo con mysql client
mysql -u root -p < db/ddl/01_schema.sql
Inicializar backend

bash
Copiar
Editar
node server/index.js
# Servidor levantado en http://localhost:3000 (o SERVER_PORT)
Inicializar frontend (Vite)

bash
Copiar
Editar
npm run dev
# Vite por defecto: http://localhost:5173
Abre el frontend y verifica que consume el backend (CORS permitido por CORS_ORIGIN).

🔌 Endpoints (REST)
Base URL del backend: http://localhost:3000/api

Usuarios
GET /usuarios — Listar

GET /usuarios/:id_usuario — Detalle

POST /usuarios — Crear
Body JSON: { "nombre": "...", "identificacion": "...", "correo": "...", "telefono": "..." }

PUT /usuarios/:id_usuario — Actualizar

DELETE /usuarios/:id_usuario — Eliminar

Libros
GET /libros

GET /libros/:isbn

POST /libros — Crear
Body: { "isbn":"...", "titulo":"...", "anio_de_publicacion":2020, "autor":"..." }

PUT /libros/:isbn

DELETE /libros/:isbn

Préstamos
GET /prestamos

GET /prestamos/:id_prestamo

POST /prestamos — Crear
Body:

json
Copiar
Editar
{
  "id_usuario": 1,
  "isbn": "ISBN-001",
  "fecha_prestamo": "2025-08-01",
  "fecha_devolucion": null,
  "estado": "activo"
}
PUT /prestamos/:id_prestamo — Actualizar (fechas/estado)

DELETE /prestamos/:id_prestamo

Notas de validación:

identificacion en usuarios es única.

fecha_prestamo es obligatoria.

estado ∈ {entregado,retrasado,activo}.

Al crear préstamo, id_usuario y isbn deben existir (FK).

📥 Carga masiva desde CSV
Hay dos formas. Elige una o usa ambas:

A) Script CLI (recomendado para lotes grandes)
Coloca tus CSV en db/csv/ con estos encabezados:

usuarios.csv: nombre,identificacion,correo,telefono

libros.csv: isbn,titulo,anio_de_publicacion,autor

prestamos.csv: id_usuario,isbn,fecha_prestamo,fecha_devolucion,estado

Ejecuta el script (ejemplo):

bash
Copiar
Editar
node server/scripts/import.js --file=db/csv/usuarios.csv --entity=usuarios
node server/scripts/import.js --file=db/csv/libros.csv --entity=libros
node server/scripts/import.js --file=db/csv/prestamos.csv --entity=prestamos
El script usa csv-parser, valida columnas y registra errores/filas rechazadas (log en server/scripts/logs/).

B) Endpoint HTTP (carga manual desde UI/Postman)
POST /api/import/:entity con multipart/form-data

Campo file: el archivo CSV

:entity ∈ usuarios | libros | prestamos

Respuesta: filas insertadas, filas con error y razones.

Reglas CSV

Separador: coma (,), codificación UTF-8.

Fechas: YYYY-MM-DD.

Asegurar ausencia de comillas no cerradas y saltos de línea dentro de celdas (o encapsular con comillas y escapar).

🧪 Pruebas rápidas (sugeridas)
Ping: GET /api/health (si existe)

Flujo mínimo:

Crear usuario y libro.

Crear préstamo activo.

Listar préstamos.

Marcar entregado (PUT préstamo con fecha_devolucion).

Errores comunes:

ER_NO_SUCH_TABLE: correr script SQL.

ECONNREFUSED 3306: verificar MySQL levantado y credenciales .env.

Error 1142 (permisos): otorgar privilegios al usuario MySQL.

CORS: ajustar CORS_ORIGIN en .env.

🛡️ Buenas prácticas aplicadas
SQL seguro: tablas con PK, FKs, UNIQUE, y tipos adecuados (YEAR, DATE, ENUM).

Validaciones en backend (requeridos, rangos, formatos).

Capas separadas: rutas → controladores → servicios → DB.

Logs: errores de importación y respuestas HTTP claras.

Idempotencia: importaciones toleran duplicados (por UNIQUE) con reporte de conflictos.

📦 Scripts útiles (sugeridos en package.json)
json
Copiar
Editar
{
  "scripts": {
    "start": "node server/index.js",
    "dev": "vite --host",
    "dev:server": "nodemon server/index.js",
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev\""
  }
}
Requiere instalar nodemon y concurrently si usas dev:all:

bash
Copiar
Editar
npm i -D nodemon concurrently
🧭 Colección Postman
Incluye en docs/ o postman/ un biblioteca.postman_collection.json con:

CRUD de usuarios, libros, prestamos

(Opcional) carpeta import con ejemplos de carga CSV (multipart)

👤 Autor / Datos de contacto
Nombre: [Tu nombre]

Email: [tu_correo@dominio.com]

Clan/Grupo: [Tu clan]

📬 Licencia
Este proyecto se distribuye bajo licencia MIT. Úsalo, modifícalo y compártelo libremente.









Preguntar a ChatGPT
