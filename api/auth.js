import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    const { mode, email, password, fullName, phone, companyName, companyReg, companyAddress1, companyAddress2, userId } = req.body;

    try {
      if (mode === 'register') {
        // Cek apakah email sudah terdaftar
        const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existing.length > 0) {
          return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
        }

        // Insert user baru dengan data perusahaan lengkap format Malaysia
        await sql`
          INSERT INTO users (fullname, phone, email, password, company_name, company_reg, company_address1, company_address2) 
          VALUES (${fullName}, ${phone}, ${email}, ${password}, ${companyName || 'YUNG SIANG ENTERPRISE SDN BHD'}, ${companyReg || 'Reg No.198701008364'}, ${companyAddress1 || 'P.O. BOX 38, 89727, KG LAMPUAS, MEMBAKUT'}, ${companyAddress2 || 'SABAH, MALAYSIA'})
        `;
        const newUser = await sql`SELECT * FROM users WHERE email = ${email}`;
        return res.status(200).json({ success: true, message: 'Register sukses!', user: newUser[0] });
      } 
      
      if (mode === 'login') {
        const users = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
        if (users.length > 0) {
          return res.status(200).json({ success: true, user: users[0] });
        } else {
          return res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }
      }

      if (mode === 'update_profile') {
        await sql`
          UPDATE users 
          SET fullname = ${fullName}, phone = ${phone}, company_name = ${companyName}, company_reg = ${companyReg}, company_address1 = ${companyAddress1}, company_address2 = ${companyAddress2}
          WHERE id = ${userId}
        `;
        const updated = await sql`SELECT * FROM users WHERE id = ${userId}`;
        return res.status(200).json({ success: true, message: 'Profil berhasil diupdate!', user: updated[0] });
      }

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}