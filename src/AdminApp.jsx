import React, { useState, useEffect } from 'react';
import { Users, LogOut, Search, FileEdit, CheckCircle, X, ShieldCheck, RefreshCw, Activity, Clock, MapPin } from 'lucide-react';

export default function AdminApp({ currentUser, onLogout }) {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // State untuk riwayat log akses
    const [accessLogs, setAccessLogs] = useState([]);
    
    // State untuk form edit langganan
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ quotaMax: 500, expiryDate: '' });

    // 1. Fungsi fetch data user secara real-time dari database (Untuk tombol manual & otomatis)
    const fetchUsersRealtime = () => {
        setIsRefreshing(true);
        fetch('/api/users', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.users)) {
                    setUsers(data.users);
                }
                setLoading(false);
                setTimeout(() => setIsRefreshing(false), 500); // Visual effect tombol muter
            })
            .catch(() => {
                console.error("Gagal load data user");
                setLoading(false);
                setIsRefreshing(false);
            });
    };

useEffect(() => {
        // Load data user saat pertama kali buka
        fetchUsersRealtime();

        // Sistem Riwayat Log Akses dengan Auto-Delete 7 Hari
        const savedLogs = JSON.parse(localStorage.getItem('admin_access_logs') || '[]');
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const validLogs = savedLogs.filter(log => log.timestamp > sevenDaysAgo);

        // Fungsi penyimpan log
        const saveLog = (ip, location, coords) => {
            const newLog = { id: Date.now(), timestamp: Date.now(), ip, location, coords };
            const updatedLogs = [newLog, ...validLogs];
            setAccessLogs(updatedLogs);
            localStorage.setItem('admin_access_logs', JSON.stringify(updatedLogs));
        };

        // Fallback jika user menolak akses GPS
        const fetchIpFallback = () => {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => saveLog(data.ip, `${data.city || 'Unknown'}, ${data.country_name || ''} (IP Base)`, `${data.latitude || 0}, ${data.longitude || 0}`))
                .catch(() => setAccessLogs(validLogs));
        };

        // 1. Ambil IP Address
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(ipData => {
                const currentIp = ipData.ip;
                
                // 2. Minta koordinat GPS tingkat akurasi tinggi ke perangkat
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            
                            // 3. Ubah koordinat GPS akurat menjadi nama Kota & Negara
                            try {
                                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
                                const geoData = await geoRes.json();
                                const exactLoc = `${geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown'}, ${geoData.countryName || ''}`;
                                
                                saveLog(currentIp, exactLoc, `${lat}, ${lon}`);
                            } catch (e) {
                                saveLog(currentIp, "Koordinat GPS Akurat", `${lat}, ${lon}`);
                            }
                        },
                        (error) => {
                            // Jika izin akses lokasi ditolak oleh user, gunakan IP Base (Jakarta dsb)
                            fetchIpFallback();
                        },
                        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                    );
                } else {
                    fetchIpFallback();
                }
            })
            .catch(() => fetchIpFallback());
    }, []);

    const handleSaveSubscription = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: editingUser.id, ...editForm })
            });
            
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => {
                    if (u.id === editingUser.id) {
                        return { ...u, subscription: { ...u.subscription, quotaMax: editForm.quotaMax, expiryDate: editForm.expiryDate } };
                    }
                    return u;
                }));
                setEditingUser(null);
                alert("Langganan user berjaya diperbarui!");
            } else {
                alert("Gagal memperbarui: " + (data.message || "Ralat pelayan"));
            }
        } catch (err) {
            alert("Terjadi kesalahan jaringan.");
        }
    };

    const filteredUsers = users.filter(u => 
        (u.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Batasi tampilan hanya 5 log terakhir agar UI tidak kepenuhan
    const displayLogs = accessLogs.slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            {/* Navbar Admin */}
            <nav className="bg-indigo-900 border-b border-indigo-800 flex items-center justify-between p-3 md:p-4 md:px-6 shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2 md:gap-3 text-white">
                    <ShieldCheck size={24} className="text-emerald-400" />
                    <div>
                        <h1 className="font-bold text-xs md:text-base tracking-wide">DIK-APPS ADMIN PANEL</h1>
                        <p className="text-[9px] md:text-[10px] text-indigo-300">Master Control System</p>
                    </div>
                </div>
                <button onClick={onLogout} className="bg-indigo-800 hover:bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                    <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
                </button>
            </nav>

            <main className="flex-1 p-3 md:p-6 max-w-7xl mx-auto w-full space-y-4 md:space-y-6">
                
                {/* Riwayat Log Akses Panel (Mobile Friendly) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-indigo-50 border-b border-indigo-100 p-3 md:p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-indigo-600" />
                            <h3 className="font-bold text-indigo-900 text-sm">Riwayat Akses Keamanan</h3>
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-wider">
                            Auto-Delete 7 Hari
                        </span>
                    </div>
                    
                    <div className="p-3 md:p-4">
                        <p className="text-xs text-slate-500 mb-3 font-medium">Menampilkan 5 aktivitas login terakhir Anda:</p>
                        <div className="space-y-2">
                            {displayLogs.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-2">Memuat data akses...</p>
                            ) : (
                                displayLogs.map((log, index) => (
                                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 md:p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 rounded-lg transition-colors gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="hidden sm:flex w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 flex-shrink-0">
                                                <MapPin size={14} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800 text-xs md:text-sm">{log.ip}</span>
                                                    {index === 0 && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">Terbaru</span>}
                                                </div>
                                                <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{log.location} • {log.coords}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium bg-white px-2 py-1 rounded border border-slate-200 w-fit">
                                            <Clock size={12} />
                                            {new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Header Section & Search (Mobile Friendly) */}
                <div className="bg-white border border-slate-200 p-4 md:p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><Users size={20} className="text-indigo-600"/> User Management</h2>
                        <p className="text-xs text-slate-500 mt-1">Kelola kuota invoice dan masa aktif langganan pengguna.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                        {/* Tombol Sync Real-time Manual */}
                        <button 
                            onClick={fetchUsersRealtime} 
                            disabled={isRefreshing}
                            className="w-full sm:w-auto bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
                        >
                            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
                            Sync Data
                        </button>
                        
                        <div className="relative w-full sm:w-64">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Cari nama atau toko..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none font-medium w-full focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Container (Responsive) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    
                    {/* TAMPILAN DESKTOP (Tabel) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User & Store</th>
                                    <th className="px-6 py-4 text-center">Masa Aktif</th>
                                    <th className="px-6 py-4 text-center">Sisa Kuota</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-slate-500">Memuat data pengguna...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-slate-500">Tiada pengguna ditemui.</td></tr>
                                ) : (
                                    filteredUsers.map(u => {
                                        const sub = u.subscription || { quotaUsed: 0, quotaMax: 0, expiryDate: new Date().toISOString() };
                                        const isExpired = new Date() > new Date(sub.expiryDate);
                                        const isFull = sub.quotaUsed >= sub.quotaMax;
                                        
                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{u.fullname}</div>
                                                    <div className="text-xs text-slate-500">{u.companyName || 'Tiada Nama Kedai'} • {u.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    {new Date(sub.expiryDate).toLocaleDateString('en-GB')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold">{sub.quotaMax - sub.quotaUsed}</span> 
                                                    <span className="text-xs text-slate-500"> / {sub.quotaMax}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {isExpired ? (
                                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Expired</span>
                                                    ) : isFull ? (
                                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Kuota Habis</span>
                                                    ) : (
                                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Active</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingUser(u);
                                                            const d = new Date(sub.expiryDate);
                                                            const dateStr = d.toISOString().split('T')[0];
                                                            setEditForm({ quotaMax: sub.quotaMax, expiryDate: dateStr });
                                                        }} 
                                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 mx-auto transition-colors"
                                                    >
                                                        <FileEdit size={14}/> Edit Paket
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* TAMPILAN MOBILE (Card List) */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500 text-sm">Memuat data pengguna...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">Tiada pengguna ditemui.</div>
                        ) : (
                            filteredUsers.map(u => {
                                const sub = u.subscription || { quotaUsed: 0, quotaMax: 0, expiryDate: new Date().toISOString() };
                                const isExpired = new Date() > new Date(sub.expiryDate);
                                const isFull = sub.quotaUsed >= sub.quotaMax;
                                
                                return (
                                    <div key={u.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-slate-800">{u.fullname}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{u.companyName || 'Tiada Nama Kedai'}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{u.phone}</div>
                                            </div>
                                            <div>
                                                {isExpired ? (
                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Expired</span>
                                                ) : isFull ? (
                                                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Kuota Habis</span>
                                                ) : (
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Active</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                                            <div className="text-center w-1/2 border-r border-slate-200">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Masa Aktif</div>
                                                <div className="font-bold text-slate-700 mt-0.5">{new Date(sub.expiryDate).toLocaleDateString('en-GB')}</div>
                                            </div>
                                            <div className="text-center w-1/2">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sisa Kuota</div>
                                                <div className="font-bold text-slate-700 mt-0.5">{sub.quotaMax - sub.quotaUsed} <span className="text-slate-400 font-normal">/ {sub.quotaMax}</span></div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => {
                                                setEditingUser(u);
                                                const d = new Date(sub.expiryDate);
                                                const dateStr = d.toISOString().split('T')[0];
                                                setEditForm({ quotaMax: sub.quotaMax, expiryDate: dateStr });
                                            }} 
                                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <FileEdit size={14}/> Edit Paket Langganan
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </main>

            {/* Modal Edit Subscription (Tetap Sama) */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center gap-2 text-sm"><ShieldCheck size={18}/> Perpanjang / Tambah Kuota</h3>
                            <button onClick={() => setEditingUser(null)} className="text-white hover:text-indigo-200"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveSubscription} className="p-5 space-y-4">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">User / Store</p>
                                <p className="font-bold text-slate-800 text-base mt-1">{editingUser.fullname}</p>
                                <p className="text-xs text-slate-600">{editingUser.companyName || 'Tiada Nama Kedai'}</p>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Masa Aktif (Hingga Tanggal)</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={editForm.expiryDate} 
                                        onChange={e => setEditForm({...editForm, expiryDate: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium focus:border-indigo-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Total Limit Kuota (Invoice)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={editForm.quotaMax} 
                                        onChange={e => setEditForm({...editForm, quotaMax: parseInt(e.target.value) || 0})} 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium focus:border-indigo-500" 
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                                        Kuota yang sudah digunakan: <span className="font-bold text-slate-700">{editingUser.subscription?.quotaUsed || 0}</span> Invoice
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors">Batal</button>
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-md">
                                    <CheckCircle size={16}/> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}