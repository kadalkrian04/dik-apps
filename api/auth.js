import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Connect ke database Neon
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    const { mode, email, password, fullName, phone } = req.body;

    try {
      if (mode === 'register') {
        // Simpan user baru ke database
        await sql`
          INSERT INTO users (fullname, phone, email, password) 
          VALUES (${fullName}, ${phone}, ${email}, ${password})
        `;
        return res.status(200).json({ success: true, message: 'Register sukses!' });
      } 
      
      if (mode === 'login') {
        // Cek user di database
        const users = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
        if (users.length > 0) {
          return res.status(200).json({ success: true, user: users[0] });
        } else {
          return res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}