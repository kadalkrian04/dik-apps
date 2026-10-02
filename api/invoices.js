import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    // Simpan Invoice Baru
    const { docNo, customerName, totalAmount, items } = req.body;
    try {
      await sql`
        INSERT INTO invoices (doc_no, customer_name, total_amount, items) 
        VALUES (${docNo}, ${customerName}, ${totalAmount}, ${JSON.stringify(items)})
      `;
      return res.status(200).json({ success: true, message: 'Invoice tersimpan!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === 'GET') {
    // Ambil data invoice untuk dashboard
    try {
      const invoices = await sql`SELECT * FROM invoices ORDER BY id DESC LIMIT 10`;
      return res.status(200).json(invoices);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}