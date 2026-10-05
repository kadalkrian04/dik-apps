import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const users = await sql`SELECT * FROM users`;
      
      const mappedUsers = users.map(u => ({
        id: u.id,
        fullname: u.fullname,
        email: u.email,
        phone: u.phone,
        companyName: u.company_name,
        role: u.role,
        subscription: u.subscription || {
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            quotaUsed: 0,
            quotaMax: 500
        }
      }));

      return res.status(200).json({ success: true, users: mappedUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data user' });
    }
  } 
  
  else if (req.method === 'PUT') {
    try {
      // Tambahkan quotaUsed ke dalam penerimaan parameter
      const { userId, quotaMax, expiryDate, quotaUsed } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID tidak ditemukan' });
      }

      const userData = await sql`SELECT subscription FROM users WHERE id = ${userId}`;
      if (userData.length === 0) {
          return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      const currentSub = userData[0].subscription || { quotaUsed: 0, quotaMax: 500 };
      
      // Update nilai jika dikirim melalui body permintaan (Partial Update)
      if (quotaMax !== undefined) currentSub.quotaMax = quotaMax;
      if (expiryDate !== undefined) currentSub.expiryDate = new Date(expiryDate).toISOString();
      if (quotaUsed !== undefined) currentSub.quotaUsed = quotaUsed;

      await sql`
        UPDATE users 
        SET subscription = ${JSON.stringify(currentSub)}::jsonb 
        WHERE id = ${userId}
      `;

      return res.status(200).json({ 
        success: true, 
        message: 'Data subscription berhasil diperbarui' 
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui langganan' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}