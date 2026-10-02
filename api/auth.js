import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { mode, email, password, fullName, phone, companyName, companyReg, address1, address2 } = req.body;

      if (mode === 'login') {
        const result = await pool.query('SELECT *, logo_url as "logoUrl" FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        
        const user = result.rows[0];
        if (user.password !== password) return res.status(401).json({ success: false, message: 'Invalid password' });
        
        return res.status(200).json({ success: true, user });
      }

      if (mode === 'register') {
        const query = `
          INSERT INTO users (fullname, email, phone, password, company_name, company_reg, company_address1, company_address2, logo_url) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *, logo_url as "logoUrl"
        `;
        const values = [
          fullName, email, phone, password,
          companyName || 'YUNG SIANG ENTERPRISE SDN BHD',
          companyReg || 'Reg No.198701008364 Company No 167082-D',
          address1 || 'P.O. BOX 38, 89727, KG LAMPUAS, MEMBAKUT',
          address2 || 'SABAH, MALAYSIA',
          null
        ];
        const result = await pool.query(query, values);
        return res.status(200).json({ success: true, user: result.rows[0] });
      }

      if (mode === 'update_profile') {
        const { userId, fullname, role, salesman, logoUrl } = req.body;
        // Penanganan userId integer agar aman
        let parsedUserId = null;
        if (userId) {
            const num = Number(userId);
            if (!isNaN(num) && num < 2147483647) parsedUserId = num;
        }

        const query = `
          UPDATE users 
          SET fullname=$1, phone=$2, role=$3, salesman=$4, company_name=$5, company_reg=$6, company_address1=$7, company_address2=$8, logo_url=$9
          WHERE id=$10 RETURNING *, logo_url as "logoUrl"
        `;
        const values = [fullname, req.body.phone, role, salesman, req.body.companyName, req.body.companyReg, req.body.companyAddress1, req.body.companyAddress2, logoUrl, parsedUserId];
        
        const result = await pool.query(query, values);
        return res.status(200).json({ success: true, user: result.rows[0] });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}