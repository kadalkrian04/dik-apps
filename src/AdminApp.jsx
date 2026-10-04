import React, { useState, useEffect } from 'react';
import { Users, LogOut, Search, FileEdit, CheckCircle, X, ShieldCheck } from 'lucide-react';

export default function AdminApp({ currentUser, onLogout }) {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State untuk form edit langganan
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ quotaMax: 500, expiryDate: '' });

    // Simulasi atau fetch data user dari database
    useEffect(() => {
        // Ganti endpoint ini sesuai dengan API backend kamu nanti
        fetch('/api/users', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.users)) {
                    setUsers(data.users);
                }
                setLoading(false);
            })
            .catch(() => {
                console.error("Gagal load data user");
                setLoading(false);
            });
    }, []);

    const handleSaveSubscription = async (e) => {
        e.preventDefault();
        
        try {
            // Panggil API untuk update langganan user di database
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: editingUser.id, ...editForm })
            });
            
            const data = await res.json();
            if (data.success) {
                // Update state lokal jika sukses
                setUsers(users.map(u => {
                    if (u.id === editingUser.id) {
                        return {
                            ...u,
                            subscription: { ...u.subscription, quotaMax: editForm.quotaMax, expiryDate: editForm.expiryDate }
                        };
                    }
                    return u;
                }));
                setEditingUser(null);
                alert("Langganan user berjaya diperbarui!");
            } else {
                alert("Gagal memperbarui: " + (data.message || "Ralat pelayan"));
            }
        } catch (err) {
            // Fallback lokal sementara jika API belum siap
            setUsers(users.map(u => {
                if (u.id === editingUser.id) {
                    return {
                        ...u,
                        subscription: { ...u.subscription, quotaMax: editForm.quotaMax, expiryDate: editForm.expiryDate }
                    };
                }
                return u;
            }));
            setEditingUser(null);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            {/* Navbar Admin */}
            <nav className="bg-indigo-900 border-b border-indigo-800 flex items-center justify-between p-4 px-6 shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-3 text-white">
                    <ShieldCheck size={24} className="text-emerald-400" />
                    <div>
                        <h1 className="font-bold text-sm md:text-base tracking-wide">DIK-APPS ADMIN PANEL</h1>
                        <p className="text-[10px] text-indigo-300">Master Control System</p>
                    </div>
                </div>
                <button onClick={onLogout} className="bg-indigo-800 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                    <LogOut size={16} /> Logout
                </button>
            </nav>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users size={20} className="text-indigo-600"/> User Management</h2>
                        <p className="text-xs text-slate-500 mt-1">Kelola kuota invoice dan masa aktif langganan pengguna.</p>
                    </div>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau toko..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none font-medium w-full md:w-72 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
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
                                                            // Format tanggal ke YYYY-MM-DD untuk input type="date"
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
                </div>
            </main>

            {/* Modal Edit Subscription */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center gap-2"><ShieldCheck size={18}/> Perpanjang / Tambah Kuota</h3>
                            <button onClick={() => setEditingUser(null)} className="text-white hover:text-indigo-200"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveSubscription} className="p-6 space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">User / Store</p>
                                <p className="font-bold text-slate-800 text-lg">{editingUser.fullname}</p>
                                <p className="text-sm text-slate-600">{editingUser.companyName}</p>
                            </div>
                            
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Masa Aktif (Hingga Tanggal)</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={editForm.expiryDate} 
                                        onChange={e => setEditForm({...editForm, expiryDate: e.target.value})} 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Total Limit Kuota (Invoice)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={editForm.quotaMax} 
                                        onChange={e => setEditForm({...editForm, quotaMax: parseInt(e.target.value) || 0})} 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" 
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Kuota yang sudah digunakan saat ini: {editingUser.subscription?.quotaUsed || 0}</p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors">Batal</button>
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
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