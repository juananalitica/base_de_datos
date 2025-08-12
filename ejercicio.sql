otal pagado por cada cliente
Suma de payment_allocation.amount_applied por cliente

SELECT c.id, c.full_name, SUM(pa.amount_applied) AS total_paid
FROM customer c
JOIN invoice i ON i.customer_id = c.id
LEFT JOIN payment_allocation pa ON pa.invoice_id = i.id
GROUP BY c.id, c.full_name
ORDER BY total_paid DESC;


2.Facturas pendientes con info de cliente y transacción asociada
Pendiente = SUM(applied) < total_amount. Muestra última transacción (si existe).

WITH paid AS (
  SELECT i.id AS invoice_id, COALESCE(SUM(pa.amount_applied),0) AS paid_amount
  FROM invoice i
  LEFT JOIN payment_allocation pa ON pa.invoice_id = i.id
  GROUP BY i.id
)
SELECT i.id AS invoice_id, c.full_name, (i.total_amount - p.paid_amount) AS pending_amount,
       t.id AS last_txn_id, t.status AS last_txn_status
FROM invoice i
JOIN customer c ON c.id = i.customer_id
JOIN paid p ON p.invoice_id = i.id
LEFT JOIN `transaction` t ON t.id = (
  SELECT t2.id FROM `transaction` t2
  JOIN payment_allocation pa2 ON pa2.transaction_id = t2.id AND pa2.invoice_id = i.id
  ORDER BY t2.txn_datetime DESC LIMIT 1
)
WHERE p.paid_amount < i.total_amount
ORDER BY pending_amount DESC;


3.Listado de transacciones por plataforma
Incluye cliente e invoice (si hubo allocation).
SELECT pl.name AS platform, t.id AS txn_id, t.txn_datetime, t.amount, t.status,
       i.id AS invoice_id, c.full_name AS customer
FROM `transaction` t
JOIN payment_platform pl ON pl.id = t.platform_id
LEFT JOIN payment_allocation pa ON pa.transaction_id = t.id
LEFT JOIN invoice i ON i.id = pa.invoice_id
LEFT JOIN customer c ON c.id = i.customer_id
WHERE pl.name = :platform -- 'Nequi' o 'Daviplata'
ORDER BY t.txn_datetime DESC;
