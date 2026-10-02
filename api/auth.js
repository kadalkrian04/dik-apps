import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Koneksi ke database Neon
    const sql = neon(process.env.DATABASE_URL);
    
    // Ambil semua data dari body request
    const { 
      mode, id, email, password, name, phone, 
      company_name, company_reg, company_address1, company_address2, 
      logo_url, logo_align, salesman 
    } = req.body;

    // 1. Logika Login
    if (mode === 'login') {
      const users = await sql`
        SELECT * FROM users 
        WHERE email = ${email} AND password = ${password}
      `;
      
      if (users.length > 0) {
        return res.status(200).json({ success: true, user: users[0] });
      } else {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }
    } 
    
    // 2. Logika Register
    else if (mode === 'register') {
      // Cek apakah email sudah terdaftar sebelumnya
      const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (existingUser.length > 0) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar, silakan gunakan email lain' });
      }
      
      // Buat ID baru jika tidak dikirim dari frontend
      const userId = id || Date.now(); 
      
      const newUser = await sql`
        INSERT INTO users (id, name, email, password, phone, role) 
        VALUES (${userId}, ${name}, ${email}, ${password}, ${phone || ''}, 'Admin') 
        RETURNING *
      `;
      
      return res.status(200).json({ success: true, user: newUser[0] });
    } 
    
    // 3. Logika Update Profile & Pengaturan Invoice
    else if (mode === 'update_profile') {
      const updatedUser = await sql`
        UPDATE users 
        SET 
          name = ${name || ''},
          phone = ${phone || ''},
          company_name = ${company_name || ''},
          company_reg = ${company_reg || ''},
          company_address1 = ${company_address1 || ''},
          company_address2 = ${company_address2 || ''},
          logo_url = ${logo_url || ''},
          logo_align = ${logo_align || 'left'},
          salesman = ${salesman || ''}
        WHERE email = ${email}
        RETURNING *
      `;
      
      return res.status(200).json({ success: true, user: updatedUser[0] });
    } 
    
    // Jika mode tidak dikenali
    else {
      return res.status(400).json({ success: false, message: 'Mode perintah tidak valid' });
    }

  } catch (error) {
    console.error("Auth API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}