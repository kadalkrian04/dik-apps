import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Ambil semua data (fullname maupun fullName agar kompatibel)
    const { 
      mode, id, email, password, fullName, fullname, phone, 
      companyName, companyReg, companyAddress1, companyAddress2, 
      logoUrl, logoAlign, salesman 
    } = req.body;

    const userName = fullname || fullName || '';

    if (mode === 'login') {
      const users = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
      if (users.length > 0) return res.status(200).json({ success: true, user: users[0] });
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    } 
    else if (mode === 'register') {
      const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      
      const userId = id || Date.now(); 
      // MENGGUNAKAN KOLOM 'fullname' AGAR TIDAK ERROR
      const newUser = await sql`
        INSERT INTO users (id, fullname, email, password, phone, role) 
        VALUES (${userId}, ${userName}, ${email}, ${password}, ${phone || ''}, 'Admin') 
        RETURNING *
      `;
      return res.status(200).json({ success: true, user: newUser[0] });
    } 
    else if (mode === 'update_profile') {
      const updated = await sql`
        UPDATE users 
        SET 
          fullname = ${userName},
          phone = ${phone || ''},
          company_name = ${companyName || ''},
          company_reg = ${companyReg || ''},
          company_address1 = ${companyAddress1 || ''},
          company_address2 = ${companyAddress2 || ''},
          logo_url = ${logoUrl || ''},
          logo_align = ${logoAlign || 'left'},
          salesman = ${salesman || ''}
        WHERE email = ${email}
        RETURNING *
      `;
      return res.status(200).json({ success: true, user: updated[0] });
    }
    
    return res.status(400).json({ success: false, message: 'Mode tidak valid' });
  } catch (error) {
    console.error("Auth API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}