-- ===============================================
-- 1) Total pagado por cada cliente
-- ===============================================
SELECT
  c.id           AS customer_id,
  c.full_name    AS customer_name,
  COALESCE(SUM(pa.amount_applied), 0) AS total_paid
FROM customers c
LEFT JOIN invoices i
  ON i.customer_id = c.id
LEFT JOIN payment_allocations pa
  ON pa.invoice_id = i.id
GROUP BY c.id, c.full_name
ORDER BY total_paid DESC, c.full_name;


-- ===============================================
-- 2) Facturas pendientes con info de cliente
--    y transacción asociada (última aplicada)
-- ===============================================
WITH paid AS (
  SELECT
    i.id            AS invoice_id,
    i.customer_id,
    i.total_amount,
    COALESCE(SUM(pa.amount_applied), 0) AS paid_amount
  FROM invoices i
  LEFT JOIN payment_allocations pa
    ON pa.invoice_id = i.id
  GROUP BY i.id, i.customer_id, i.total_amount
),
latest_txn AS (
  SELECT
    pa.invoice_id,
    t.id           AS transaction_id,
    t.txn_datetime,
    t.status       AS transaction_status,
    t.platform_id
  FROM payment_allocations pa
  JOIN transactions t
    ON t.id = pa.transaction_id
  JOIN (
    SELECT
      pa.invoice_id,
      MAX(t.txn_datetime) AS max_txn_datetime
    FROM payment_allocations pa
    JOIN transactions t
      ON t.id = pa.transaction_id
    GROUP BY pa.invoice_id
  ) m
    ON m.invoice_id = pa.invoice_id
   AND m.max_txn_datetime = t.txn_datetime
)
SELECT
  i.id                        AS invoice_id,
  c.full_name                 AS customer_name,
  i.billing_period,
  i.total_amount,
  p.paid_amount,
  (i.total_amount - p.paid_amount) AS pending_amount,
  lt.transaction_id,
  lt.txn_datetime,
  lt.transaction_status
FROM invoices i
JOIN customers c
  ON c.id = i.customer_id
JOIN paid p
  ON p.invoice_id = i.id
LEFT JOIN latest_txn lt
  ON lt.invoice_id = i.id
WHERE p.paid_amount < i.total_amount
ORDER BY pending_amount DESC, i.id;


-- ===============================================
-- 3) Listado de transacciones por plataforma
--    (reemplaza 'Nequi' por 'Daviplata' u otra)
-- ===============================================
SELECT
  pl.name            AS platform,
  t.id               AS transaction_id,
  t.txn_datetime,
  t.amount,
  t.status           AS transaction_status,
  i.id               AS invoice_id,
  c.full_name        AS customer_name
FROM transactions t
JOIN payment_platforms pl
  ON pl.id = t.platform_id
LEFT JOIN payment_allocations pa
  ON pa.transaction_id = t.id
LEFT JOIN invoices i
  ON i.id = pa.invoice_id
LEFT JOIN customers c
  ON c.id = i.customer_id
WHERE pl.name = 'Nequi'
ORDER BY t.txn_datetime DESC, t.id;
