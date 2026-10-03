import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  // Setup CORS biar PC lokal bisa akses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. PC Toko nanya (GET): "Ada antrean pending buat cabang saya?"
    if (req.method === 'GET') {
      const { shop } = req.query; // contoh url nanti: /api/print-queue?shop=CABANG_A
      
      if (!shop) return res.status(400).json({ error: 'Parameter cabang (shop) wajib diisi' });

      // Ambil 1 invoice paling lama yang statusnya 'pending' untuk cabang tersebut
      const query = `
        SELECT * FROM invoices 
        WHERE print_status = 'pending' AND target_shop = $1 
        ORDER BY created_at ASC 
        LIMIT 1;
      `;
      const result = await pool.query(query, [shop]);
      
      return res.status(200).json({ success: true, data: result.rows });
    }

    // 2. PC Toko lapor (POST): "Udah kelar diprint nih, ubah statusnya"
    if (req.method === 'POST') {
      const { docNo } = req.body;
      
      if (!docNo) return res.status(400).json({ error: 'Document No wajib diisi' });

      const query = `
        UPDATE invoices 
        SET print_status = 'printed' 
        WHERE doc_no = $1 
        RETURNING *;
      `;
      const result = await pool.query(query, [docNo]);
      
      return res.status(200).json({ success: true, message: 'Status updated to printed' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}