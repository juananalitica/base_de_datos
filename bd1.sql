-- ============================================================
-- Fintech Payments DB (MySQL 8+) - versión "easy" estilo ejemplo
-- Estructura mínima para el caso: clientes, facturas, plataformas,
-- transacciones y aplicación de pagos (parciales)
-- ============================================================

-- Base de datos (cambia por tu nombre real: pd_nombre_apellido_clan)
DROP DATABASE IF EXISTS pd_firstname_lastname_clan;
CREATE DATABASE pd_firstname_lastname_clan CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE pd_firstname_lastname_clan;

SET sql_mode = 'STRICT_ALL_TABLES';

-- ============================================================
-- Limpieza por si se re-ejecuta
-- ============================================================
DROP TABLE IF EXISTS payment_allocations;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payment_platforms;
DROP TABLE IF EXISTS customers;

-- ============================================================
-- Tabla: payment_platforms (catálogo)
-- ============================================================
CREATE TABLE payment_platforms (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Tabla: customers
-- ============================================================
CREATE TABLE customers (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  document_number VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Tabla: invoices
--  - id es PK natural (ej: FAC7068)
--  - billing_period como 'YYYY-MM'
-- ============================================================
CREATE TABLE invoices (
  id VARCHAR(20) NOT NULL PRIMARY KEY,
  customer_id INT NOT NULL,
  billing_period CHAR(7) NOT NULL,             -- ejemplo: 2024-06
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_invoice_customer_id ON invoices(customer_id);

-- ============================================================
-- Tabla: transactions
--  - nombre en plural para evitar palabra reservada TRANSACTION
--  - status: PENDING | FAILED | COMPLETED
--  - txn_type: INVOICE_PAYMENT (extensible)
-- ============================================================
CREATE TABLE transactions (
  id VARCHAR(20) NOT NULL PRIMARY KEY,         -- ej: TXN001
  platform_id INT NOT NULL,
  txn_datetime DATETIME NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  status ENUM('PENDING','FAILED','COMPLETED') NOT NULL,
  txn_type ENUM('INVOICE_PAYMENT') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_platform
    FOREIGN KEY (platform_id) REFERENCES payment_platforms(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_txn_platform_id ON transactions(platform_id);
CREATE INDEX idx_txn_datetime ON transactions(txn_datetime);

-- ============================================================
-- Tabla: payment_allocations
--  - Resuelve la relación N:M entre invoices y transactions
--  - Permite pagos parciales (amount_applied)
-- ============================================================
CREATE TABLE payment_allocations (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(20) NOT NULL,
  transaction_id VARCHAR(20) NOT NULL,
  amount_applied DECIMAL(12,2) NOT NULL CHECK (amount_applied >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alloc_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_alloc_txn
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_alloc UNIQUE (invoice_id, transaction_id)
) ENGINE=InnoDB;

CREATE INDEX idx_alloc_invoice_id ON payment_allocations(invoice_id);
CREATE INDEX idx_alloc_transaction_id ON payment_allocations(transaction_id);

-- ============================================================
-- Semilla mínima de plataformas (opcional)
-- ============================================================
INSERT INTO payment_platforms (name) VALUES ('Nequi'), ('Daviplata');

-- ============================================================
-- Consultas rápidas de verificación (como en tu ejemplo)
-- ============================================================
SELECT * FROM payment_platforms;
SELECT * FROM customers;
SELECT * FROM invoices;
SELECT * FROM transactions;
SELECT * FROM payment_allocations;
