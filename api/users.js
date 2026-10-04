// api/users.js

export default async function handler(req, res) {
    // Pastikan hanya bisa diakses via metode yang diizinkan
    if (req.method === 'GET') {
        try {
            // TODO: Ganti bagian ini dengan query database kamu (NeonDB / MySQL)
            // Contoh query: SELECT id, fullname, email, phone, company_name, role, subscription FROM users
            
            // CONTOH DATA DUMMY (Hapus jika sudah pakai database)
            const dummyUsers = [
                {
                    id: '1',
                    fullname: 'User Contoh',
                    email: 'user@example.com',
                    phone: '+60 123456789',
                    companyName: 'Toko ABC',
                    role: 'user',
                    subscription: {
                        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                        quotaUsed: 150,
                        quotaMax: 500
                    }
                }
            ];

            return res.status(200).json({ success: true, users: dummyUsers });
        } catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ success: false, message: 'Gagal mengambil data user' });
        }
    } 
    
    else if (req.method === 'PUT') {
        try {
            const { userId, quotaMax, expiryDate } = req.body;

            if (!userId) {
                return res.status(400).json({ success: false, message: 'User ID tidak ditemukan' });
            }

            // TODO: Ganti dengan query UPDATE ke database kamu
            // Contoh query: 
            // UPDATE users SET subscription = JSON_OBJECT('quotaMax', ?, 'expiryDate', ?, 'quotaUsed', quotaUsed) WHERE id = ?
            
            return res.status(200).json({ 
                success: true, 
                message: 'Langganan berhasil diperbarui' 
            });
        } catch (error) {
            console.error("Error updating subscription:", error);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui langganan' });
        }
    } 
    
    else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}