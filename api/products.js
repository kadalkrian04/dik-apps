import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    const { userId } = req.query;
    try {
      // WAJIB: Ambil produk berdasarkan ID akunnya aja!
      const products = await sql`SELECT * FROM products WHERE user_id = ${userId}`;
      return res.status(200).json({ success: true, products });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
  }

  if (req.method === 'POST') {
    const { userId, name, price } = req.body;
    try {
      const newProduct = await sql`
        INSERT INTO products (user_id, name, price) 
        VALUES (${userId}, ${name}, ${price}) RETURNING *
      `;
      return res.status(200).json({ success: true, product: newProduct[0] });
    } catch (e) { return res.status(500).json({ success: false }); }
  }
}