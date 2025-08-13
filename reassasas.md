Fintech Data Manager — ExpertSoft (Module 4)
Monolithic system to normalize, store, and manage financial information coming from Fintech platforms (e.g., Nequi, Daviplata) originally delivered as messy Excel files.
Backend is built with Node.js + Express, database is MySQL, and the minimal dashboard lives in app/ (HTML/CSS/JS, served with Vite).

Motto: “First read, understand, plan — then code.”

🚀 Tech Stack
Node.js (LTS)

Express.js

MySQL 8+

Vite (frontend dev server)

csv-parser (CSV ingestion)

dotenv, mysql2

(Optional) Postman for API testing

📁 Project Structure
bash
Copiar
Editar
fintech-data-manager/
│
├── app/                      # Minimal dashboard (frontend)
│   ├── index.html
│   ├── styles.css
│   └── main.js
│
├── server/                   # Backend (Express)
│   ├── index.js              # Server bootstrap (CORS, routes, error handler)
│   ├── routes/
│   │   ├── customers.routes.js
│   │   ├── invoices.routes.js
│   │   ├── transactions.routes.js
│   │   └── reports.routes.js # Advanced queries
│   ├── controllers/
│   ├── services/
│   ├── db/
│   │   └── pool.js
│   └── validations/
│
├── db/                       # Database artifacts
│   ├── schema.sql            # DDL: tables, PK/FK, constraints
│   └── seed.sql              # (Optional) small demo dataset
│
├── data/                     # Source data (CSV converted from Excel)
│   └── transactions.csv
│
├── scripts/                  # Local scripts
│   └── load_csv.js           # Bulk load CSV → MySQL
│
├── docs/
│   ├── erd.pdf               # Relational model (draw.io export)
│   └── erd.png
│
├── postman/
│   └── ExpertSoft_Module4.postman_collection.json
│
├── .env                      # Environment variables (create it)
├── .gitignore
├── index.html                # Optional landing (proxy to app/)
└── README.md
🧠 What You’ll Build (Scope & Goals)
Normalize the messy Excel into a clean relational model (1NF, 2NF, 3NF).

Create the MySQL database and tables (English names, PK/FK, constraints).

Bulk-load the data from CSV locally (script and/or frontend trigger).

CRUD (complete) for one entity (Customers in this project).

Advanced queries exposed as REST endpoints (tested with Postman):

Total paid by each customer

Pending invoices with customer and related transaction

Transactions by platform (Nequi/Daviplata)

🧩 Relational Model (Summary)
All entities/attributes are in English as required.

Core entities

payment_platforms (id, name)

customers (id, full_name, document_number, email, phone, address)

invoices (id, invoice_number, billing_period, billed_amount, status, customer_id)

transactions (id, external_code, occurred_at, amount, status, txn_type, customer_id, platform_id, invoice_id, receipt_number)

Notes

1NF: atomic values (no repeated groups), one value per cell.

2NF: no partial dependencies on composite keys (each table has a single-column PK).

3NF: no transitive dependencies (e.g., platform name separated into payment_platforms).

Cardinalities:

A customer has many invoices and transactions.

An invoice can be paid by multiple transactions (via invoice_id on transactions).

A payment_platform has many transactions.

Find the complete ERD in docs/erd.pdf.

🗄️ Database Creation (DDL)
Database name format: pd_firstname_lastname_clan (change to your own).

Run the schema:

bash
Copiar
Editar
# MySQL CLI example
mysql -u root -p -h 127.0.0.1 -P 3306 < db/schema.sql
What db/schema.sql includes:

CREATE DATABASE pd_firstname_lastname_clan ...;

USE pd_firstname_lastname_clan;

payment_platforms, customers, invoices, transactions with:

PKs, FKs, NOT NULL, UNIQUE, CHECK (where applicable), indexes.

The database must exist before bulk loading.

🔁 From Excel to CSV (Required)
Open the original .xlsx and export to CSV (UTF-8).

Place the CSV in data/transactions.csv.

Expected header (example aligned to the model):

csv
Copiar
Editar
transaction_id,transaction_datetime,transaction_amount,transaction_status,transaction_type,customer_full_name,document_number,address,phone,email,platform_name,invoice_number,billing_period,billed_amount,paid_amount
If your input headers differ, adjust the mapping inside scripts/load_csv.js (documented inline).

⚙️ Installation & Run
Clone & install

bash
Copiar
Editar
git clone https://github.com/<your-user>/fintech-data-manager.git
cd fintech-data-manager
npm install
Environment variables (.env)

env
Copiar
Editar
# MySQL
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pd_firstname_lastname_clan
DB_PORT=3306

# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173
Create schema

bash
Copiar
Editar
mysql -u root -p -h 127.0.0.1 -P 3306 < db/schema.sql
Bulk load CSV (local script)

bash
Copiar
Editar
node scripts/load_csv.js --file ./data/transactions.csv
The script:

Upserts payment_platforms and customers.

Inserts/updates invoices.

Inserts transactions linked to invoices & customers.

Validates types and required fields; logs rejected rows.

Start backend

bash
Copiar
Editar
node server/index.js
# or
npm run server
Start frontend (Vite)

bash
Copiar
Editar
npm run dev
# default: http://localhost:5173
🧮 CRUD & API
Base URL
bash
Copiar
Editar
http://localhost:3000/api
CRUD: Customers
GET /customers — list

GET /customers/:id — detail

POST /customers — create (validates email, document uniqueness)

PUT /customers/:id — update (partial fields allowed)

DELETE /customers/:id — soft delete or hard delete (project choice; documented in code)

Invoices & Transactions (minimal endpoints to support dashboard & reports)
GET /invoices?status=pending|paid

GET /transactions?platformId=:platformId

GET /platforms — catalog (Nequi, Daviplata, …)

📊 Advanced Queries (via REST + Postman)
Import postman/ExpertSoft_Module4.postman_collection.json.

Total paid by each customer
GET /reports/total-paid-by-customer
SQL (reference):

sql
Copiar
Editar
SELECT
  c.id AS customer_id,
  c.full_name,
  COALESCE(SUM(t.amount), 0) AS total_paid
FROM customers c
LEFT JOIN transactions t ON t.customer_id = c.id AND t.status = 'SUCCESS'
GROUP BY c.id, c.full_name
ORDER BY total_paid DESC;
Pending invoices with customer & related transaction
GET /reports/pending-invoices
SQL (reference):

sql
Copiar
Editar
SELECT
  i.id AS invoice_id,
  i.invoice_number,
  i.billing_period,
  i.billed_amount,
  c.full_name AS customer,
  COALESCE(SUM(CASE WHEN t.status='SUCCESS' THEN t.amount ELSE 0 END),0) AS paid_amount,
  (i.billed_amount - COALESCE(SUM(CASE WHEN t.status='SUCCESS' THEN t.amount ELSE 0 END),0)) AS pending_amount,
  MAX(t.external_code) AS last_transaction_code
FROM invoices i
JOIN customers c ON c.id = i.customer_id
LEFT JOIN transactions t ON t.invoice_id = i.id
GROUP BY i.id, i.invoice_number, i.billing_period, i.billed_amount, c.full_name
HAVING pending_amount > 0
ORDER BY pending_amount DESC;
Transactions by platform
GET /reports/transactions-by-platform?platformId=:id
SQL (reference):

sql
Copiar
Editar
SELECT
  t.id,
  t.external_code,
  t.occurred_at,
  t.amount,
  t.status,
  t.txn_type,
  p.name AS platform,
  c.full_name AS customer,
  i.invoice_number
FROM transactions t
JOIN payment_platforms p ON p.id = t.platform_id
JOIN customers c ON c.id = t.customer_id
LEFT JOIN invoices i ON i.id = t.invoice_id
WHERE t.platform_id = ? 
ORDER BY t.occurred_at DESC;
🖥️ Dashboard (Frontend)
A minimal UI in app/ to:

List/create/update/delete Customers

View Invoices and basic status

(Optional bonus) Trigger CSV load with a local button calling POST /admin/bulk-load (see Extra Points)

Run with Vite:

bash
Copiar
Editar
npm run dev
# Open http://localhost:5173
🧪 Postman Collection
Import postman/ExpertSoft_Module4.postman_collection.json.

Includes:

CRUD: /api/customers

Reports: /api/reports/*

📥 Extra Points (+ up to 10)
CSV load via endpoint (documented & secured for local use):

POST /api/admin/bulk-load

Body: { "filePath": "data/transactions.csv" }

Server reuses the mapping/validation from scripts/load_csv.js.

Keep this endpoint local only (env flag) and never expose in production.

🔒 Data Validation & Constraints
Backend validation with validations/* (required fields, types, email format).

Database level:

NOT NULL, UNIQUE on document_number, email, invoice_number.

FK constraints for referential integrity.

(Optional) CHECK on status and txn_type enums.

🧹 Normalization (How it was applied)
1NF: split multi-line addresses; ensure a single platform value per transaction; dates in ISO.

2NF: non-key attributes depend entirely on the key (e.g., platform_name moved to payment_platforms).

3NF: remove transitive dependencies (e.g., avoid storing platform_name in transactions beyond platform_id; keep customer data in customers).

🧰 Troubleshooting
ER_ACCESS_DENIED_ERROR: verify .env credentials and that the user has CREATE, ALTER, INSERT, SELECT, UPDATE, DELETE.

Cannot add or update a child row: load order matters (platforms/customers → invoices → transactions).

CSV encoding issues: re-export as UTF-8; ensure comma delimiter and quoted fields where needed.

CORS: update CORS_ORIGIN in .env to match your frontend URL.

✅ Acceptance Criteria Checklist
 Relational model (well-structured, normalized) included as PNG/PDF

 MySQL DDL complete with English names and constraints (db/schema.sql)

 CSV bulk load functional and documented (scripts/load_csv.js and/or endpoint)

 CRUD implemented (/api/customers) + dashboard

 Postman collection with CRUD + 3 advanced reports

 README (this file) clear and complete

👤 Developer
Name: Your Name Here

Clan: Your Clan

Email: your.email@example.com

📬 License
This project is released under the MIT License. Feel free to use, modify, and distribute.

Appendix — Example .sql Run Order
bash
Copiar
Editar
mysql -u root -p -h 127.0.0.1 -P 3306 -e "SOURCE db/schema.sql;"
node scripts/load_csv.js --file ./data/transactions.csv
node server/index.js
If you need I can also generate db/schema.sql, scripts/load_csv.js, and skeleton routes/controllers exactly matching this README.









Preguntar a ChatGPT





ChatGPT puede cometer errores. Considera verificar la informac