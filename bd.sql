-- Catálogo
CREATE TABLE payment_platform (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Cliente
CREATE TABLE customer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  document_number VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  address TEXT
);

-- Factura
CREATE TABLE invoice (
  id VARCHAR(20) PRIMARY KEY,                -- ej: FAC7068
  customer_id INT NOT NULL,
  billing_period CHAR(7) NOT NULL,           -- 'YYYY-MM'
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Transacción
CREATE TABLE `transaction` (
  id VARCHAR(20) PRIMARY KEY,                -- ej: TXN001
  platform_id INT NOT NULL,
  txn_datetime DATETIME NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  status ENUM('PENDING','FAILED','COMPLETED') NOT NULL,
  txn_type ENUM('INVOICE_PAYMENT') NOT NULL,
  CONSTRAINT fk_txn_platform FOREIGN KEY (platform_id) REFERENCES payment_platform(id)
);

-- Aplicación de pagos (permite parciales y muchos-a-muchos)
CREATE TABLE payment_allocation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(20) NOT NULL,
  transaction_id VARCHAR(20) NOT NULL,
  amount_applied DECIMAL(12,2) NOT NULL CHECK (amount_applied >= 0),
  CONSTRAINT fk_alloc_invoice FOREIGN KEY (invoice_id) REFERENCES invoice(id),
  CONSTRAINT fk_alloc_txn FOREIGN KEY (transaction_id) REFERENCES `transaction`(id),
  CONSTRAINT uq_alloc UNIQUE (invoice_id, transaction_id) -- evita duplicar
);
