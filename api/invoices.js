import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM invoices ORDER BY id DESC LIMIT 20');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { docNo, customerName, totalAmount, items, userId, printStatus = 'none', targetShop = '' } = req.body;
      
      const query = `
        INSERT INTO invoices (doc_no, customer_name, total_amount, items, user_id, print_status, target_shop) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        ON CONFLICT (doc_no) 
        DO UPDATE SET 
            customer_name = EXCLUDED.customer_name,
            total_amount = EXCLUDED.total_amount,
            items = EXCLUDED.items,
            print_status = EXCLUDED.print_status,
            target_shop = EXCLUDED.target_shop
        RETURNING *;
      `;
      
      // FIX: Langsung jadikan string, hapus batasan integer supaya ID besar bisa masuk!
      const safeUserId = userId ? userId.toString() : null;

      const values = [
        docNo || 'DOC-0000',
        customerName || 'CASH CUSTOMER',
        totalAmount || 0,
        JSON.stringify(items || []),
        safeUserId,
        printStatus,
        targetShop
      ];

      const result = await pool.query(query, values);
      return res.status(200).json({ success: true, invoice: result.rows[0] });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}