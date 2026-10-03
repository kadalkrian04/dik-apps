import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // PC Toko nanya data pakai User ID akun kliennya
    if (req.method === 'GET') {
      const { userId, shop = '' } = req.query;
      
      if (!userId) return res.status(400).json({ error: 'User ID wajib diisi' });

      // 1. Cari antrean print milik akun tersebut (user_id diubah ke text agar aman dari error integer)
      const invQuery = `
        SELECT * FROM invoices 
        WHERE print_status = 'pending' AND user_id::text = $1 AND target_shop = $2 
        ORDER BY created_at ASC 
        LIMIT 1;
      `;
      const invResult = await pool.query(invQuery, [userId, shop]);
      
      if (invResult.rows.length === 0) return res.status(200).json({ success: true, data: [] });
      
      const invoice = invResult.rows[0];

      // 2. Cari data profil toko (nama, alamat) milik klien tersebut
      const userQuery = `SELECT * FROM users WHERE id::text = $1`;
      const userResult = await pool.query(userQuery, [userId]);
      const user = userResult.rows[0] || {};

      // 3. Gabungkan data agar Script PC bisa menggambar PDF dengan benar
      const dataToPrint = {
          ...invoice,
          company_name: user.company_name || 'NAMA TOKO BELUM DISET',
          company_reg: user.company_reg || '',
          company_address1: user.company_address1 || '',
          company_address2: user.company_address2 || '',
      };

      return res.status(200).json({ success: true, data: [dataToPrint] });
    }

    if (req.method === 'POST') {
      const { docNo } = req.body;
      const query = `UPDATE invoices SET print_status = 'printed' WHERE doc_no = $1 RETURNING *;`;
      await pool.query(query, [docNo]);
      return res.status(200).json({ success: true, message: 'Status updated to printed' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}