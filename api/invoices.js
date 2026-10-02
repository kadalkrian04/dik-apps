import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    const { docNo, customerName, totalAmount, items, userId } = req.body;
    try {
      await sql`
        INSERT INTO invoices (doc_no, customer_name, total_amount, items, user_id) 
        VALUES (${docNo}, ${customerName}, ${totalAmount}, ${JSON.stringify(items)}, ${userId ? String(userId) : null})
      `;
      return res.status(200).json({ success: true, message: 'Invoice berhasil disimpan ke database!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const invoices = await sql`SELECT * FROM invoices ORDER BY id DESC LIMIT 20`;
      return res.status(200).json(invoices);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}