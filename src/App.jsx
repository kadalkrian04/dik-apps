import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileEdit, Plus, Printer, 
  Smartphone, Eye, Trash2, DollarSign, Activity,
  BarChart3, FileSpreadsheet, Download, 
  LogOut, User, CheckCircle, ShieldCheck, Building2, Lock, Mail, Phone, Image as ImageIcon,
  Package, Save, Send, RefreshCw, Search, X, CreditCard
} from 'lucide-react';
import AdminApp from './AdminApp';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dik_auth') === 'true';
  });
  const [authMode, setAuthMode] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('dik_user');
    if (savedUser) {
       const parsed = JSON.parse(savedUser);
       if (!parsed.subscription) {
           parsed.subscription = { 
               expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), 
               quotaUsed: 0, 
               quotaMax: 500 
           };
       }
       return parsed;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('dik_auth', isAuthenticated);
    if (currentUser && currentUser.email) {
      localStorage.setItem('dik_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dik_user');
    }
  }, [isAuthenticated, currentUser]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(); 
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <AuthScreen 
        authMode={authMode} 
        setAuthMode={setAuthMode} 
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  // Cek jika yang login adalah admin (berdasarkan role atau email spesifik)
  if (currentUser.role === 'admin' || currentUser.email === 'admin@dik-apps.com') {
      return <AdminApp currentUser={currentUser} onLogout={handleLogout} />;
  }

  return <CashSalesWorkspace currentUser={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout} />;
}

// ==========================================
// WORKSPACE KASIR / PENGGUNA BIASA
// ==========================================
function CashSalesWorkspace({ currentUser, setCurrentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('sales');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/products?userId=${currentUser.id}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.products)) {
                setProducts(data.products);
            }
        }).catch(err => console.error("Gagal load produk:", err));
    }
  }, [currentUser]);

  const getTodayDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [invoiceData, setInvoiceData] = useState({
    companyName: currentUser.companyName || '',
    companyReg: currentUser.companyReg || '',
    companyAddress1: currentUser.companyAddress1 || '',
    companyAddress2: currentUser.companyAddress2 || '',
    
    showLogo: true,
    logoUrl: currentUser.logoUrl || '',
    logoAlign: currentUser.logoAlign || 'left', 

    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerFax: '',
    customerGst: '',
    paymentMethod: 'CASH',
    
    docTitle: 'INVOICE',
    docNo: localStorage.getItem('dik_last_doc_no') || '',
    docDate: getTodayDate(),
    salesman: currentUser.salesman || currentUser.fullname || '',
    pageInfo: 'Page 1 of 1',
    
    remarks: `Warranty Coverage
* Waranti hanya meliputi kerosakan teknikal (hardware).
* Kerosakan akibat jatuh, pecah, air atau kecuaian tidak dilindungi.
* Waranti terbatal jika peranti dibuka atau dibaiki oleh pihak lain.
* Battery Health tidak termasuk dalam waranti.
* Sebarang tuntutan tertakluk kepada pemeriksaan juruteknik ${currentUser.companyName || 'pihak kami'}.
Goods sold are strictly non-refundable. Warranty claim requires this official receipt.`,
    discountTotal: 0,
    roundCent: 0,
  });

  const [items, setItems] = useState([
    { id: 1, desc: '', imei: '', status: 'NEW', warranty: '', qty: 1, uom: 'UNIT', price: 0, discount: 0 }
  ]);

  const calculateItemAmount = (item) => {
    return (parseFloat(item.qty || 0) * parseFloat(item.price || 0)) - parseFloat(item.discount || 0);
  };

  const subTotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  const totalAmount = subTotal - parseFloat(invoiceData.discountTotal || 0) - parseFloat(invoiceData.roundCent || 0);
  const formatCurrency = (val) => parseFloat(val || 0).toFixed(2);

  const numberToWords = (amount) => {
    const num = Math.floor(Number(amount));
    if (isNaN(num) || num <= 0) return "Zero Only";
    
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertChunk = (val) => {
      let str = '';
      if (Math.floor(val / 100) > 0) {
        str += a[Math.floor(val / 100)] + ' Hundred ';
        val %= 100;
      }
      if (val > 0) {
        if (val < 20) {
          str += a[val] + ' ';
        } else {
          str += b[Math.floor(val / 10)] + ' ';
          if (val % 10 > 0) str += a[val % 10] + ' ';
        }
      }
      return str;
    };

    let result = '';
    let tempNum = num;
    
    if (Math.floor(tempNum / 1000000) > 0) {
      result += convertChunk(Math.floor(tempNum / 1000000)) + 'Million ';
      tempNum %= 1000000;
    }
    if (Math.floor(tempNum / 1000) > 0) {
      result += convertChunk(Math.floor(tempNum / 1000)) + 'Thousand ';
      tempNum %= 1000;
    }
    if (tempNum > 0) {
      result += convertChunk(tempNum);
    }
    
    return result.replace(/\s+/g, ' ').trim() + ' Only';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative print:bg-white print:min-h-0">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body, html, #root { 
            background-color: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        input, select, textarea { font-size: 16px !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <nav className="no-print bg-white border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between p-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm md:text-base leading-tight">DIK-APPS STORE</h1>
              <p className="text-[10px] md:text-xs text-slate-500">Sabah POS System</p>
            </div>
          </div>
          <button onClick={onLogout} className="md:hidden flex text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-2 bg-slate-100 p-1 md:rounded-lg border-y md:border border-slate-200 overflow-x-auto no-scrollbar mx-0 md:mx-2">
          <TabButton icon={<LayoutDashboard size={16} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <TabButton icon={<FileEdit size={16} />} label="Cash Sales" isActive={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
          <TabButton icon={<Package size={16} />} label="Products" isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <TabButton icon={<BarChart3 size={16} />} label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <TabButton icon={<User size={16} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>

        <div className="hidden md:flex items-center gap-3 p-3 md:px-6">
          <button onClick={onLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-red-200">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="no-print flex-1 overflow-auto relative p-3 md:p-6">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} currentUser={currentUser} />}
        {activeTab === 'products' && <ProductsView products={products} setProducts={setProducts} currentUser={currentUser} />}
        {activeTab === 'sales' && (
          <SalesWorkspace 
            invoiceData={invoiceData} setInvoiceData={setInvoiceData}
            items={items} setItems={setItems} products={products}
            subTotal={subTotal} totalAmount={totalAmount}
            calculateItemAmount={calculateItemAmount}
            formatCurrency={formatCurrency}
            numberToWords={numberToWords}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}
        {activeTab === 'reports' && <ReportsView currentUser={currentUser} />}
        {activeTab === 'profile' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} setInvoiceData={setInvoiceData} invoiceData={invoiceData} />}
      </main>

      <div className="hidden print-only print:block w-full absolute top-0 left-0 bg-white m-0 p-0 z-50">
        {activeTab === 'reports' ? (
             <ReportPrintPreview currentUser={currentUser} />
        ) : (
            <A4Preview 
                invoiceData={invoiceData} items={items} 
                calculateItemAmount={calculateItemAmount} formatCurrency={formatCurrency} 
                subTotal={subTotal} totalAmount={totalAmount} numberToWords={numberToWords} 
                currentUser={currentUser}
            />
        )}
      </div>
    </div>
  );
}

function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center whitespace-nowrap gap-2 px-3 py-2 md:px-4 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}>
      {icon} {label}
    </button>
  );
}

function ProductsView({ products, setProducts, currentUser }) {
    const [newProduct, setNewProduct] = useState({ name: '', price: '' });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', price: '' });

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, ...newProduct })
            });
            const data = await res.json();
            if(data.success) {
                setProducts([...products, data.product]);
                setNewProduct({ name: '', price: '' });
            } else {
                alert("Gagal simpan ke DB: " + (data.message || "Error di Backend"));
            }
        } catch (err) {
            alert("Error! Pastikan file api/products.js sudah dibuat dan berjalan.");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Hapus produk ini dari daftar?")) return;
        try {
            const res = await fetch(`/api/products?id=${id}&userId=${currentUser.id}`, { method: 'DELETE' });
            const data = await res.json();
            if(data.success) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Gagal menghapus dari DB");
            }
        } catch(e) { 
            alert("Error koneksi saat menghapus");
        }
    };

    const handleSaveEdit = async (id) => {
        try {
            const res = await fetch(`/api/products?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, ...editForm })
            });
            const data = await res.json();
            if(data.success) {
                setProducts(products.map(p => p.id === id ? { ...p, name: editForm.name, price: editForm.price } : p));
                setEditingId(null);
            } else {
                setProducts(products.map(p => p.id === id ? { ...p, name: editForm.name, price: editForm.price } : p));
                setEditingId(null);
            }
        } catch (err) {
            setProducts(products.map(p => p.id === id ? { ...p, name: editForm.name, price: editForm.price } : p));
            setEditingId(null);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Product Masterlist</h2>
                    <p className="text-xs text-slate-500">Kelola daftar barang agar lebih cepat saat membuat invois.</p>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Cari produk..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none font-medium w-full md:w-64 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm h-fit">
                    <h3 className="font-bold text-sm mb-4 border-b pb-2">Add New Product</h3>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product Name</label>
                            <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm outline-none font-medium" placeholder="e.g. iPhone 15 Pro Max" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Default Price (MYR)</label>
                            <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm outline-none font-medium" placeholder="4500.00" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm">
                            <Save size={16} /> {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </form>
                </div>

                <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                    <div className="overflow-y-auto flex-1 no-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">Product Name</th>
                                    <th className="px-4 py-3 text-right">Price (MYR)</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-6 text-slate-500 text-xs">Belum ada produk atau tidak ditemukan!</td></tr>
                                ) : (
                                    filteredProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {editingId === p.id ? (
                                                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-slate-300 rounded px-2 py-1 outline-none text-sm focus:ring-1 focus:ring-indigo-300" />
                                                ) : p.name}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-indigo-700">
                                                {editingId === p.id ? (
                                                    <input type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-24 text-right border border-slate-300 rounded px-2 py-1 outline-none text-sm ml-auto focus:ring-1 focus:ring-indigo-300" />
                                                ) : parseFloat(p.price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {editingId === p.id ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button onClick={() => handleSaveEdit(p.id)} className="text-emerald-500 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50" title="Simpan"><CheckCircle size={18}/></button>
                                                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100" title="Batal"><X size={18}/></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, price: p.price }); }} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Edit"><FileEdit size={18}/></button>
                                                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Hapus"><Trash2 size={18}/></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SalesWorkspace({ 
  invoiceData, setInvoiceData, items, setItems, products,
  subTotal, totalAmount, 
  calculateItemAmount, formatCurrency, numberToWords, currentUser, setCurrentUser 
}) {
  const [workspaceMode, setWorkspaceMode] = useState('form'); 
  const [isSaving, setIsSaving] = useState(false);
  const [targetShop, setTargetShop] = useState('CABANG_A');
  const [printStatusInfo, setPrintStatusInfo] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkQuotaLimit = () => {
      const sub = currentUser.subscription || { quotaUsed: 0, quotaMax: 500, expiryDate: new Date() };
      const isExpired = new Date() > new Date(sub.expiryDate);
      const isFull = sub.quotaUsed >= sub.quotaMax;

      if (isExpired) {
          alert("Maaf, masa aktif langganan Anda telah habis (1 Bulan). Sila hubungi Admin untuk memperpanjang akses.");
          return false;
      }
      if (isFull) {
          alert("Maaf, kuota cetak invoice Anda (Batas 500) telah habis. Sila hubungi Admin.");
          return false;
      }
      return true;
  };

  const incrementQuotaUsed = () => {
      const updatedUser = {
          ...currentUser,
          subscription: {
              ...currentUser.subscription,
              quotaUsed: (currentUser.subscription?.quotaUsed || 0) + 1
          }
      };
      setCurrentUser(updatedUser);
  };

  const handlePrintLocal = () => {
    if (!checkQuotaLimit()) return;
    if (invoiceData.docNo) localStorage.setItem('dik_last_doc_no', invoiceData.docNo);
    incrementQuotaUsed();
    window.print();
  };

  const handleSaveToDB = async (printStatus = 'none') => {
    if (!checkQuotaLimit()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docNo: invoiceData.docNo,
          customerName: invoiceData.customerName,
          customerAddress: invoiceData.customerAddress,
          customerPhone: invoiceData.customerPhone,
          customerFax: invoiceData.customerFax,
          customerGst: invoiceData.customerGst,
          discountTotal: invoiceData.discountTotal || 0,
          roundCent: invoiceData.roundCent || 0,
          totalAmount: totalAmount,
          items: items,
          userId: currentUser.id,
          printStatus: printStatus, 
          targetShop: printStatus === 'pending' ? targetShop : '' 
        })
      });
      const data = await res.json();
      
      if(data.success) {
        incrementQuotaUsed();
        if (printStatus === 'pending') {
            alert(`Berjaya! Arahan print telah dihantar ke antrean ${targetShop}. PC Toko akan mencetaknya sebentar lagi.`);
            setPrintStatusInfo('pending');
        } else {
            alert("Invois berjaya disimpan ke pangkalan data!");
        }
        if (invoiceData.docNo) localStorage.setItem('dik_last_doc_no', invoiceData.docNo);
      } else {
        alert("Gagal: " + (data.message || "Ralat tidak diketahui"));
      }
    } catch (err) {
      alert("Ralat Rangkaian: " + err.message);
    }
    setIsSaving(false);
  };

  const checkPrintStatus = async () => {
      if (!invoiceData.docNo) return;
      setIsCheckingStatus(true);
      try {
          const res = await fetch('/api/invoices', { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data)) {
              const currentInv = data.find(i => i.doc_no === invoiceData.docNo && String(i.user_id) === String(currentUser.id));
              if (currentInv) {
                  setPrintStatusInfo(currentInv.print_status);
              } else {
                  setPrintStatusInfo('none');
              }
          }
      } catch (e) {
          console.error("Gagal menyemak status print", e);
      }
      setTimeout(() => setIsCheckingStatus(false), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-shrink-0">
               <button onClick={() => setWorkspaceMode('form')} className={`flex-1 sm:flex-initial px-4 py-2 flex items-center justify-center gap-2 text-xs md:text-sm font-semibold rounded-md transition-all ${workspaceMode === 'form' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
                 <FileEdit size={16}/> Edit Form
               </button>
               <button onClick={() => setWorkspaceMode('preview')} className={`flex-1 sm:flex-initial px-4 py-2 flex items-center justify-center gap-2 text-xs md:text-sm font-semibold rounded-md transition-all ${workspaceMode === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
                 <Eye size={16}/> A4 Preview
               </button>
            </div>
            
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-lg px-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                   <span>Print Status:</span>
                   {printStatusInfo === 'pending' ? <span className="text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded">Pending...</span> : 
                    printStatusInfo === 'printed' ? <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={12}/> Berhasil</span> : 
                    <span className="text-slate-400">-</span>}
                </div>
                <button onClick={checkPrintStatus} disabled={isCheckingStatus || !invoiceData.docNo} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-md transition-colors disabled:opacity-50" title="Semak Status Cetakan">
                    <RefreshCw size={14} className={isCheckingStatus ? "animate-spin" : ""} />
                </button>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-2 items-stretch sm:items-center w-full lg:w-auto">
          <div className="flex w-full sm:w-auto items-center bg-indigo-50 border border-indigo-200 rounded-lg overflow-hidden flex-shrink-0">
             <select 
               value={targetShop} 
               onChange={(e) => setTargetShop(e.target.value)} 
               className="bg-transparent text-indigo-800 text-xs font-bold px-2 py-2.5 outline-none cursor-pointer border-r border-indigo-200 w-1/2 sm:w-auto text-center sm:text-left"
             >
                <option value="CABANG_A">CABANG A</option>
                <option value="CABANG_B">CABANG B</option>
                <option value="CABANG_C">CABANG C</option>
                <option value="CABANG_D">CABANG D</option>
             </select>
             <button onClick={() => handleSaveToDB('pending')} disabled={isSaving} className="w-1/2 sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
               <Send size={14} /> Print to Shop
             </button>
          </div>

          <div className="flex w-full sm:w-auto gap-2">
              <button onClick={() => handleSaveToDB('none')} disabled={isSaving} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                {isSaving ? 'Menyimpan...' : 'Save Data'}
              </button>
              <button onClick={handlePrintLocal} className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                <Printer size={16} /> Print (Lokal)
              </button>
          </div>
        </div>
      </div>

      <div>
        {workspaceMode === 'form' ? (
          <SalesForm 
            invoiceData={invoiceData} setInvoiceData={setInvoiceData}
            items={items} setItems={setItems} products={products}
            subTotal={subTotal} totalAmount={totalAmount}
          />
        ) : (
          <div className="w-full bg-slate-200 p-2 md:p-8 rounded-xl shadow-inner overflow-x-auto">
            <div className="pointer-events-none origin-top mx-auto w-[794px] print:w-auto shadow-2xl bg-white">
               <A4Preview 
                invoiceData={invoiceData} items={items} 
                calculateItemAmount={calculateItemAmount} formatCurrency={formatCurrency} 
                subTotal={subTotal} totalAmount={totalAmount} numberToWords={numberToWords} 
                currentUser={currentUser}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SalesForm({ invoiceData, setInvoiceData, items, setItems, subTotal, totalAmount, products }) {
  const handleDataChange = (field, value) => setInvoiceData({ ...invoiceData, [field]: value });
  
  const handleItemChange = (id, field, value) => {
    setItems(items.map(i => {
        if (i.id === id) {
            const updatedItem = { ...i, [field]: value };
            if (field === 'desc') {
                const matchedProduct = products.find(p => p.name.toLowerCase() === value.toLowerCase());
                if (matchedProduct) {
                    updatedItem.price = matchedProduct.price; 
                }
            }
            return updatedItem;
        }
        return i;
    }));
  };

  const addItem = () => setItems([...items, { id: Date.now(), desc: '', imei: '', status: 'NEW', warranty: '', qty: 1, uom: 'UNIT', price: 0, discount: 0 }]);
  const removeItem = (id) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };

  return (
    <div className="space-y-4 md:space-y-6">
      
      <FormSection title="1. DISPLAY SETTINGS">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
           <div className="flex-shrink-0">
              <div className="relative flex flex-col items-center justify-center w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden">
                 {invoiceData.logoUrl ? (
                   <img src={invoiceData.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-2" />
                 ) : (
                   <div className="flex flex-col items-center text-slate-400 text-center p-2">
                     <ImageIcon size={24} className="mb-1 opacity-50"/>
                     <span className="text-[9px] font-bold uppercase">No Logo in Profile</span>
                   </div>
                 )}
              </div>
           </div>
           <div className="flex-1 space-y-3 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                 <input type="checkbox" id="showLogo" checked={invoiceData.showLogo} onChange={(e) => handleDataChange('showLogo', e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
                 <label htmlFor="showLogo" className="text-sm font-bold text-slate-700 cursor-pointer">Display Logo on Invoice</label>
              </div>
              
              {invoiceData.showLogo && (
                <div className="flex items-center gap-3 sm:pl-8">
                  <label className="text-xs font-bold text-slate-600">Logo Alignment:</label>
                  <select 
                    value={invoiceData.logoAlign} 
                    onChange={(e) => handleDataChange('logoAlign', e.target.value)}
                    className="bg-white border border-slate-300 rounded p-1 text-xs font-medium outline-none"
                  >
                    <option value="left">Left (Kiri)</option>
                    <option value="center">Center Top (Tengah Atas)</option>
                  </select>
                </div>
              )}
              
              <p className="text-xs text-slate-500 max-w-md sm:pl-8">Toggle to show or hide the store logo on the printed invoice. <b>To change the logo, go to the Profile tab.</b></p>
           </div>
        </div>
      </FormSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <FormSection title="2. CUSTOMER DETAILS">
          <div className="space-y-3">
            <InputGroup label="Customer Name" value={invoiceData.customerName} onChange={(e) => handleDataChange('customerName', e.target.value)} />
            <InputGroup label="Address" value={invoiceData.customerAddress} onChange={(e) => handleDataChange('customerAddress', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <InputGroup label="Phone No." value={invoiceData.customerPhone} onChange={(e) => handleDataChange('customerPhone', e.target.value)} />
              <div>
                <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                <select value={invoiceData.paymentMethod} onChange={(e) => handleDataChange('paymentMethod', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-medium outline-none">
                  <option>CASH</option><option>CREDIT CARD</option><option>DEBIT CARD</option><option>BANK TRANSFER</option><option>DUITNOW QR</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputGroup label="Fax" value={invoiceData.customerFax} onChange={(e) => handleDataChange('customerFax', e.target.value)} />
              <InputGroup label="GST / SST Reg #" value={invoiceData.customerGst} onChange={(e) => handleDataChange('customerGst', e.target.value)} />
            </div>
          </div>
        </FormSection>

        <FormSection title="3. DOCUMENT SETTINGS">
          <div className="space-y-3">
            <InputGroup label="Document Title" value={invoiceData.docTitle} onChange={(e) => handleDataChange('docTitle', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <InputGroup label="Document No" value={invoiceData.docNo} onChange={(e) => handleDataChange('docNo', e.target.value)} />
              <InputGroup label="Date (DD/MM/YYYY)" value={invoiceData.docDate} onChange={(e) => handleDataChange('docDate', e.target.value)} />
            </div>
            <InputGroup label="Salesman / Attendant" value={invoiceData.salesman} onChange={(e) => handleDataChange('salesman', e.target.value)} />
            <InputGroup label="Page Info" value={invoiceData.pageInfo} onChange={(e) => handleDataChange('pageInfo', e.target.value)} />
          </div>
        </FormSection>
      </div>

      <FormSection title="4. DEVICE & ACCESSORY ITEMS" action={
          <button onClick={addItem} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1">
            + Add New Item Line
          </button>
      }>
        <div className="space-y-4">
          
          <datalist id="products-datalist">
              {products.map((p, idx) => <option key={idx} value={p.name} />)}
          </datalist>

          {items.map((item, index) => (
            <div key={item.id} className="border border-slate-200 bg-slate-50 p-3 md:p-4 rounded-xl relative group">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Item #{index + 1}</span>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                  Remove <Trash2 size={12}/>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 relative">
                    <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase mb-1">Description</label>
                    <input 
                       list="products-datalist" 
                       type="text" 
                       value={item.desc} 
                       onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} 
                       placeholder="Select or type product..."
                       className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-medium outline-none" 
                    />
                  </div>
                  <div className="md:col-span-4">
                    <InputGroup label="IMEI / Serial Number" value={item.imei} onChange={(e) => handleItemChange(item.id, 'imei', e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select value={item.status} onChange={(e) => handleItemChange(item.id, 'status', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-medium outline-none">
                      <option value="NEW">NEW</option>
                      <option value="SECOND/USED">SECOND/USED</option>
                      <option value="REFURBISHED">REFURBISHED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                   <div className="col-span-2 md:col-span-4">
                      <InputGroup label="Warranty" value={item.warranty} onChange={(e) => handleItemChange(item.id, 'warranty', e.target.value)} />
                   </div>
                   <div className="md:col-span-2">
                      <InputGroup label="Qty" type="number" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} align="center" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase mb-1">UOM</label>
                      <select value={item.uom} onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm outline-none">
                        <option value="UNIT">UNIT</option><option value="PCS">PCS</option><option value="SET">SET</option>
                        <option value="LGT">LGT</option><option value="BOX">BOX</option>
                      </select>
                   </div>
                   <div className="md:col-span-2">
                      <InputGroup label="Price (MYR)" type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} align="right" />
                   </div>
                   <div className="md:col-span-2">
                      <InputGroup label="Disc (MYR)" type="number" value={item.discount} onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)} align="right" textColor="text-red-500" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="5. SUMMARY & REMARKS">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
             <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase mb-1">Remarks</label>
             <textarea rows="7" value={invoiceData.remarks} onChange={(e) => handleDataChange('remarks', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs md:text-sm outline-none resize-none" />
          </div>
          <div className="w-full lg:w-[350px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 space-y-2">
             <div className="flex justify-between items-center text-xs md:text-sm font-medium">
               <span>Sub Total:</span><span>MYR {subTotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-xs md:text-sm">
               <span className="text-red-500 font-medium">Discount:</span>
               <input type="number" value={invoiceData.discountTotal} onChange={(e) => handleDataChange('discountTotal', e.target.value)} className="w-20 bg-white border border-slate-300 rounded p-1 text-right text-xs outline-none" />
             </div>
             <div className="flex justify-between items-center text-xs md:text-sm">
               <span className="text-slate-500 font-medium">Round cent:</span>
               <input type="number" value={invoiceData.roundCent} onChange={(e) => handleDataChange('roundCent', e.target.value)} className="w-20 bg-white border border-slate-300 rounded p-1 text-right text-xs outline-none" />
             </div>
             <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between items-center">
               <span className="text-sm md:text-lg font-bold text-slate-800">Total Amount:</span>
               <span className="text-base md:text-xl font-extrabold text-indigo-600">MYR {totalAmount.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
}

function FormSection({ title, action, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 p-3 md:p-4 flex justify-between items-center">
        <h3 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text", align = "left", textColor = "text-slate-900", placeholder = "" }) {
  return (
    <div>
      <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-medium outline-none ${textColor}`} style={{ textAlign: align }} />
    </div>
  );
}

function A4Preview({ invoiceData, items, calculateItemAmount, formatCurrency, subTotal, totalAmount, numberToWords, currentUser }) {
  return (
    <div className="w-[794px] min-h-[1123px] print:w-[210mm] print:min-h-[297mm] bg-white text-black font-sans box-border relative mx-auto px-[40px] pt-[40px] pb-[20px] flex flex-col leading-snug">
      
      {invoiceData.logoAlign === 'center' && invoiceData.showLogo && invoiceData.logoUrl && (
        <div className="flex justify-center mb-4">
           <img src={invoiceData.logoUrl} alt="Logo" className="h-[70px] object-contain" />
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-start max-w-[65%]">
          {invoiceData.logoAlign === 'left' && invoiceData.showLogo && invoiceData.logoUrl && (
             <img src={invoiceData.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-[14px] font-bold uppercase mb-0.5">{invoiceData.companyName}</h1>
            <p className="text-[12px]">{invoiceData.companyReg}</p>
            <p className="text-[12px] whitespace-pre-line">{invoiceData.companyAddress1}<br/>{invoiceData.companyAddress2}</p>
          </div>
        </div>
        <div className="border-[1.5px] border-black px-10 py-1.5 font-bold text-[15px] uppercase tracking-wide">
          {invoiceData.docTitle}
        </div>
      </div>

      <div className="flex justify-between mb-4 text-[12px]">
        <div className="w-[58%] pr-2 space-y-[2px]">
          <div className="flex">
            <span className="w-16 font-bold uppercase">NAME:</span>
            <span className="uppercase font-bold">{invoiceData.customerName || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-16 font-bold uppercase">ADDRESS:</span>
            <span className="uppercase flex-1">{invoiceData.customerAddress || '-'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-16 font-bold uppercase">PHONE:</span>
            <span className="w-32">{invoiceData.customerPhone || '-'}</span>
            <span className="w-10 font-bold uppercase">FAX :</span>
            <span>{invoiceData.customerFax || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-16 font-bold uppercase">GST Reg #</span>
            <span>{invoiceData.customerGst || '-'}</span>
          </div>
        </div>
        
        <div className="w-[40%] space-y-[2px] pl-4">
          <div className="flex justify-between">
            <span className="font-bold uppercase">DOCUMENT NO</span>
            <span>{invoiceData.docNo || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold uppercase">DATE</span>
            <span>{invoiceData.docDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold uppercase">SALESMAN</span>
            <span className="uppercase">{invoiceData.salesman || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold uppercase">PAGE</span>
            <span>{invoiceData.pageInfo}</span>
          </div>
        </div>
      </div>

      <table className="w-full text-[13px] mb-8 border-collapse mt-4">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="py-1.6 text-left font-bold w-[5%]">Item</th>
            <th className="py-1.6 text-left font-bold w-[35%]">Description</th>
            <th className="py-1.6 text-center font-bold w-[6%]">Status</th>
            <th className="py-1.6 text-center font-bold w-[16%]">Warranty</th>
            <th className="py-1.6 text-center font-bold w-[6%]">Quantity</th>
            <th className="py-1.6 text-center font-bold w-[6%]">Uom</th>
            <th className="py-1.6 text-right font-bold w-[10%]">Unit Price</th>
            <th className="py-1.6 text-right font-bold w-[8%]">Discount</th>
            <th className="py-1.6 text-right font-bold w-[10%]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="py-2 align-top">{index + 1}</td>
              <td className="py-2 align-top">
                <div className="font-semibold">{item.desc}</div>
                {item.imei && item.imei !== '-' && <div className="text-[11px] mt-0.5 text-gray-700">SN/IMEI: {item.imei}</div>}
              </td>
              <td className="py-2 align-top text-center font-semibold">{item.status}</td>
              <td className="py-2 align-top text-center text-[11px]">{item.warranty || '-'}</td>
              <td className="py-2 align-top text-center">{item.qty}</td>
              <td className="py-2 align-top text-center">{item.uom}</td>
              <td className="py-2 align-top text-right">{formatCurrency(item.price)}</td>
              <td className="py-2 align-top text-right">{formatCurrency(item.discount)}</td>
              <td className="py-2 align-top text-right">{formatCurrency(calculateItemAmount(item))}</td>
            </tr>
          ))}
          <tr style={{ height: '10px' }}><td colSpan="7"></td></tr>
        </tbody>
      </table>

      <div className="flex justify-between text-[12px] mt-1 mb-8 border-t-[1.5px] border-black pt-2">
        <div className="w-[60%] pr-6">
          <p className="mb-2">
            <span className="font-bold">Malaysia Ringgit</span><span className="font-bold"> &nbsp;{numberToWords(totalAmount)}</span>
          </p>
          <p className="font-bold mb-0.5">Remark:</p>
          <p className="text-[11px] leading-tight text-gray-700 whitespace-pre-wrap">{invoiceData.remarks}</p>
        </div>
        
        <div className="w-[35%] space-y-0.5">
          <div className="flex justify-between">
            <span>Sub Total:</span>
            <span className="w-20 text-right">{formatCurrency(subTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span className="w-20 text-right">{formatCurrency(invoiceData.discountTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Round cent:</span>
            <span className="w-20 text-right">{formatCurrency(invoiceData.roundCent)}</span>
          </div>
          <div className="border-t-[1.5px] border-black border-b-[2px] border-black py-1 mt-1 flex justify-between font-bold text-[13px]">
            <span>Total Amount:</span>
            <span className="w-24 text-right flex justify-between">
              <span>MYR</span>
              <span>{formatCurrency(totalAmount)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-24 flex justify-between text-[12px] w-full pb-4">
        <div className="w-[42%]">
          <div className="border-t-[1.5px] border-black pt-1.5 font-bold uppercase">{invoiceData.customerName}</div>
        </div>
        <div className="w-[42%]">
          <div className="border-t-[1.5px] border-black pt-1.5">
            <p className="font-bold">Company Cop Signature</p>
            <p className="mt-0.5">Name: {currentUser?.salesman || '-'}</p>
            <p className="mt-0.5">Date: {invoiceData.docDate}</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function DashboardView({ setActiveTab, currentUser }) {
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/invoices', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          const userSales = data.filter(inv => inv.user_id === currentUser.id || inv.userId === currentUser.id);
          setRecentSales(userSales);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser.id]);

  const totalSales = recentSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || sale.totalAmount || 0), 0);
  const totalReceipts = recentSales.length;
  const totalItems = recentSales.reduce((sum, sale) => {
      let count = 0;
      if (typeof sale.items === 'string') { try { count = JSON.parse(sale.items).length; } catch(e){} } 
      else if (Array.isArray(sale.items)) { count = sale.items.length; }
      return sum + count;
  }, 0);
  const avgTransaction = totalReceipts > 0 ? (totalSales / totalReceipts) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 p-5 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            DIK-APPS Terminal Active
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            Welcome, {currentUser.fullname || 'User'} <span className="text-2xl">👋</span>
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Manage cash receipts, mobile device sales, and print invoices easily.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={() => setActiveTab('sales')} className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all">
            <Plus size={18} /> New Receipt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL SALES" value={`MYR ${totalSales.toFixed(2)}`} sub="All time record" icon={<DollarSign size={20}/>} color="emerald" />
        <StatCard title="RECEIPTS ISSUED" value={`${totalReceipts} Bills`} sub="Saved in database" icon={<FileSpreadsheet size={20}/>} color="blue" />
        <StatCard title="DEVICES / ITEMS" value={`${totalItems} Units`} sub="Total items sold" icon={<Smartphone size={20}/>} color="indigo" />
        <StatCard title="AVG TRANSACTION" value={`MYR ${avgTransaction.toFixed(2)}`} sub="Basket size average" icon={<Activity size={20}/>} color="purple" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm md:text-base">Recent Cash Sales Receipts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] md:text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 md:px-6 py-3">Bill No</th>
                <th className="px-4 md:px-6 py-3">Date</th>
                <th className="px-4 md:px-6 py-3">Customer</th>
                <th className="px-4 md:px-6 py-3">Items</th>
                <th className="px-4 md:px-6 py-3 text-right">Amount (MYR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4 text-slate-500 text-xs">Loading database records...</td></tr>
              ) : recentSales.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-slate-500 text-xs">No saved receipts yet</td></tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 md:px-6 py-3 font-bold text-slate-800 text-xs md:text-sm">{sale.doc_no || sale.docNo}</td>
                    <td className="px-4 md:px-6 py-3 text-slate-700 text-xs md:text-sm">{new Date(sale.created_at || Date.now()).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 md:px-6 py-3 text-slate-700 text-xs md:text-sm">{sale.customer_name || sale.customerName}</td>
                    <td className="px-4 md:px-6 py-3 text-slate-500 text-xs">
                      {sale.items ? (typeof sale.items === 'string' ? JSON.parse(sale.items).length : sale.items.length) : 0} items
                    </td>
                    <td className="px-4 md:px-6 py-3 text-right font-bold text-slate-800 text-xs md:text-sm">{parseFloat(sale.total_amount || sale.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon, color }) {
  const colors = { emerald: 'bg-emerald-100 text-emerald-600', blue: 'bg-blue-100 text-blue-600', indigo: 'bg-indigo-100 text-indigo-600', purple: 'bg-purple-100 text-purple-600' };
  return (
    <div className="bg-white border border-slate-200 p-4 md:p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">{title}</p>
        <h4 className="text-xl md:text-2xl font-extrabold text-slate-800">{value}</h4>
        <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 mt-1">{sub}</p>
      </div>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors[color]}`}>{icon}</div>
    </div>
  );
}

function ReportsView({ currentUser }) {
  const [salesData, setSalesData] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [timeFilter, setTimeFilter] = useState('1M');
  
  useEffect(() => {
    fetch('/api/invoices', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          const userSales = data.filter(inv => inv.user_id === currentUser.id || inv.userId === currentUser.id);
          setSalesData(userSales);
        }
      })
      .catch(() => {});
  }, [currentUser.id]);

  useEffect(() => {
    if (salesData.length === 0) return;
    const now = new Date();
    const filtered = salesData.filter(sale => {
      if (timeFilter === 'ALL') return true;
      const saleDate = new Date(sale.created_at || Date.now());
      const diffTime = Math.abs(now - saleDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeFilter === '1M') return diffDays <= 30;
      if (timeFilter === '3M') return diffDays <= 90;
      if (timeFilter === '6M') return diffDays <= 180;
      return true;
    });
    setFilteredSales(filtered);
  }, [salesData, timeFilter]);

  const totalIncome = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || sale.totalAmount || 0), 0);
  const totalInvoices = filteredSales.length;

  const exportToCSV = () => {
    if (filteredSales.length === 0) return alert("No data to export.");
    const headers = ["Date", "Invoice No", "Customer Name", "Total Amount (MYR)"];
    const csvContent = [
      headers.join(","),
      ...filteredSales.map(sale => {
        const date = new Date(sale.created_at || Date.now()).toLocaleDateString('en-GB');
        const docNo = sale.doc_no || sale.docNo || '-';
        const name = `"${(sale.customer_name || sale.customerName || '').replace(/"/g, '""')}"`;
        const amount = parseFloat(sale.total_amount || sale.totalAmount || 0).toFixed(2);
        return `${date},${docNo},${name},${amount}`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Report_${timeFilter}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => { window.print(); };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800">Financial Reports</h2>
          <p className="text-xs md:text-sm text-slate-500">Sales Statements & Performance</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
           <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-bold text-slate-700 outline-none"
           >
              <option value="1M">Last 1 Month</option>
              <option value="3M">Last 3 Months</option>
              <option value="6M">Last 6 Months</option>
              <option value="ALL">All Time</option>
           </select>

          <button onClick={exportToCSV} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
            <FileSpreadsheet size={16} /> Excel (CSV)
          </button>
          <button onClick={exportToPDF} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
             <Printer size={16} /> Export PDF
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 md:p-6 rounded-xl">
            <p className="text-xs font-bold text-indigo-500 mb-1">Total Sales Income</p>
            <h4 className="text-xl md:text-2xl font-extrabold text-indigo-900">MYR {totalIncome.toFixed(2)}</h4>
            <p className="text-[10px] text-indigo-400 mt-2">Filter: {timeFilter === 'ALL' ? 'All Time' : `Last ${timeFilter.replace('M', ' Months')}`}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 md:p-6 rounded-xl">
            <p className="text-xs font-bold text-blue-500 mb-1">Total Invoices Created</p>
            <h4 className="text-xl md:text-2xl font-extrabold text-blue-900">{totalInvoices} Bills</h4>
            <p className="text-[10px] text-blue-400 mt-2">Successful transactions</p>
          </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
         <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Detailed Breakdown</h3>
         </div>
         <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase text-[10px] md:text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Amount (MYR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredSales.length === 0 ? (
                   <tr><td colSpan="4" className="text-center py-6 text-slate-500 text-xs">No records found for this period.</td></tr>
               ) : (
                   filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700 text-xs">{new Date(sale.created_at || Date.now()).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 text-xs">{sale.doc_no || sale.docNo || '-'}</td>
                        <td className="px-4 py-3 text-slate-700 text-xs">{sale.customer_name || sale.customerName || '-'}</td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-700 text-xs">{parseFloat(sale.total_amount || sale.totalAmount || 0).toFixed(2)}</td>
                    </tr>
                   ))
               )}
            </tbody>
          </table>
         </div>
      </div>
    </div>
  );
}

function ReportPrintPreview({ currentUser }) {
    const [salesData, setSalesData] = useState([]);
  
    useEffect(() => {
      fetch('/api/invoices', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if(Array.isArray(data)) {
            const userSales = data.filter(inv => inv.user_id === currentUser.id || inv.userId === currentUser.id);
            setSalesData(userSales);
          }
        })
        .catch(() => {});
    }, [currentUser.id]);

    const totalIncome = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_amount || sale.totalAmount || 0), 0);

    return (
        <div className="w-full bg-white text-black p-10 font-sans print:w-[210mm] print:h-auto mx-auto">
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">{currentUser.companyName || 'SALES REPORT'}</h1>
                <p className="text-sm mt-1">Official Financial Statement</p>
                <p className="text-xs text-gray-600 mt-1">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
            
            <div className="mb-6 flex justify-between text-sm">
                <div>
                    <span className="font-bold">Total Invoices: </span> {salesData.length} Bills
                </div>
                <div>
                    <span className="font-bold">Total Revenue: </span> MYR {totalIncome.toFixed(2)}
                </div>
            </div>

            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="border-y-[1.5px] border-black text-left">
                        <th className="py-2 px-1">Date</th>
                        <th className="py-2 px-1">Invoice No.</th>
                        <th className="py-2 px-1">Customer</th>
                        <th className="py-2 px-1 text-right">Amount (MYR)</th>
                    </tr>
                </thead>
                <tbody>
                    {salesData.map(sale => (
                        <tr key={sale.id} className="border-b border-gray-200 border-dashed">
                            <td className="py-2 px-1">{new Date(sale.created_at || Date.now()).toLocaleDateString('en-GB')}</td>
                            <td className="py-2 px-1 font-semibold">{sale.doc_no || sale.docNo || '-'}</td>
                            <td className="py-2 px-1">{sale.customer_name || sale.customerName || '-'}</td>
                            <td className="py-2 px-1 text-right font-bold">{parseFloat(sale.total_amount || sale.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-8 text-right border-t-[1.5px] border-black pt-2">
                <span className="font-bold text-sm">GRAND TOTAL: MYR {totalIncome.toFixed(2)}</span>
            </div>
            <div className="mt-20 text-center text-[10px] text-gray-500">
                End of Report
            </div>
        </div>
    );
}

function ProfileView({ currentUser, setCurrentUser, setInvoiceData, invoiceData }) {
  const [formData, setFormData] = useState({
      ...currentUser,
      companyName: currentUser.companyName || '',
      companyReg: currentUser.companyReg || '',
      companyAddress1: currentUser.companyAddress1 || '',
      companyAddress2: currentUser.companyAddress2 || ''
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const sub = currentUser.subscription || { quotaUsed: 0, quotaMax: 500, expiryDate: new Date() };
  const quotaPercentage = (sub.quotaUsed / sub.quotaMax) * 100;
  const isExpired = new Date() > new Date(sub.expiryDate);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'update_profile', userId: formData.id, ...formData })
      });
      const data = await res.json();
      if(data.success) {
        const mappedUser = {
          ...formData,
          ...data.user,
          fullname: data.user.name || data.user.fullname || formData.fullname,
          companyName: data.user.company_name || formData.companyName,
          companyReg: data.user.company_reg || formData.companyReg,
          companyAddress1: data.user.company_address1 || formData.companyAddress1,
          companyAddress2: data.user.company_address2 || formData.companyAddress2,
          logoUrl: data.user.logo_url || formData.logoUrl,
          logoAlign: data.user.logo_align || formData.logoAlign || 'left',
          salesman: data.user.salesman || formData.salesman,
          subscription: currentUser.subscription
        };
        setCurrentUser(mappedUser);
        setInvoiceData({
          ...invoiceData,
          companyName: mappedUser.companyName,
          companyReg: mappedUser.companyReg,
          companyAddress1: mappedUser.companyAddress1,
          companyAddress2: mappedUser.companyAddress2,
          logoUrl: mappedUser.logoUrl || '',
          logoAlign: mappedUser.logoAlign || 'left',
          salesman: mappedUser.salesman
        });
        setSaved(true); setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.message || 'Update failed');
      }
    } catch {
      setCurrentUser(formData);
      setInvoiceData({
        ...invoiceData,
        companyName: formData.companyName,
        companyReg: formData.companyReg,
        companyAddress1: formData.companyAddress1,
        companyAddress2: formData.companyAddress2,
        logoUrl: formData.logoUrl || '',
        logoAlign: formData.logoAlign || 'left',
        salesman: formData.salesman
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-extrabold text-2xl overflow-hidden">
          {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : (formData.fullname || 'U').charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">{formData.fullname || 'New User'}</h2>
          <p className="text-xs text-slate-500 font-medium">DIK-APPS STORE USER</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <ShieldCheck size={20} className="text-indigo-600" /> Personal & Store Details
        </h3>
        {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2"><CheckCircle size={16} /> Update Saved!</div>}

        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-shrink-0">
              <label className="cursor-pointer relative flex flex-col items-center justify-center w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors overflow-hidden group">
                 {formData.logoUrl ? (
                   <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-1" />
                 ) : (
                   <div className="flex flex-col items-center text-slate-400">
                     <ImageIcon size={24} className="mb-1 opacity-50"/>
                     <span className="text-[9px] font-bold uppercase">Upload Logo</span>
                   </div>
                 )}
                 <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                 {formData.logoUrl && (
                   <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs font-bold">
                     Change
                   </div>
                 )}
              </label>
            </div>
            
            <div className="flex-1 w-full">
              <h4 className="text-sm font-bold text-slate-800">Store Logo Configuration</h4>
              <p className="text-xs text-slate-500 mt-1 mb-3 max-w-sm">Upload your company logo and set its default position on the invoice.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                 <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Logo Alignment:</label>
                    <select 
                      value={formData.logoAlign || 'left'} 
                      onChange={e => setFormData({...formData, logoAlign: e.target.value})}
                      className="bg-white border border-slate-300 rounded p-1.5 text-xs font-medium outline-none"
                    >
                      <option value="left">Left (Kiri)</option>
                      <option value="center">Center Top (Tengah Atas)</option>
                    </select>
                 </div>
                 {formData.logoUrl && (
                   <button type="button" onClick={() => setFormData({...formData, logoUrl: ''})} className="text-xs text-red-500 font-bold hover:underline">
                     Remove Logo
                   </button>
                 )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input type="text" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salesman / Attendant</label>
              <input type="text" value={formData.salesman} onChange={e => setFormData({...formData, salesman: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" required />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-indigo-600" /> Default Store Info for Invoice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SSM Reg No / Company No</label>
                <input type="text" value={formData.companyReg} onChange={e => setFormData({...formData, companyReg: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address 1</label>
                <input type="text" value={formData.companyAddress1} onChange={e => setFormData({...formData, companyAddress1: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address 2</label>
                <input type="text" value={formData.companyAddress2} onChange={e => setFormData({...formData, companyAddress2: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600" /> Subscription & Quota
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Current Plan: 1 Month Basic</span>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md ${isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                    </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Active until: {new Date(sub.expiryDate).toLocaleDateString('en-GB')}</span>
                    <span>Quota: {sub.quotaUsed} / {sub.quotaMax} Invoices</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${quotaPercentage >= 100 ? 'bg-red-600' : (quotaPercentage > 80 ? 'bg-amber-500' : 'bg-indigo-600')}`} style={{ width: `${Math.min(quotaPercentage, 100)}%` }}></div>
                </div>
                {(quotaPercentage >= 100 || isExpired) && (
                    <p className="text-xs text-red-600 font-bold mt-2">
                        {isExpired ? 'Masa aktif langganan anda telah tamat.' : 'Anda telah mencapai batas maksimal pembuatan invoice.'} Sila hubungi Admin untuk memperpanjang.
                    </p>
                )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow-md transition-all">
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AuthScreen({ authMode, setAuthMode, onLogin }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); const [phone, setPhone] = useState('+60 ');
  const [companyName, setCompanyName] = useState(''); 
  const [companyReg, setCompanyReg] = useState('');
  const [address1, setAddress1] = useState(''); 
  const [address2, setAddress2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Cek jika yg coba login adalah admin
    const isLoginAdmin = email === 'admin@dik-apps.com';

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: authMode, email, password, fullName, phone, companyName, companyReg, address1, address2 })
      });
      const data = await res.json();
      if (data.success) { 
        const mappedUser = {
          ...data.user,
          id: data.user.id,
          fullname: data.user.name || data.user.fullname || fullName || '',
          email: data.user.email || email,
          phone: data.user.phone || phone,
          companyName: data.user.company_name || companyName || '',
          companyReg: data.user.company_reg || companyReg || '',
          companyAddress1: data.user.company_address1 || address1 || '',
          companyAddress2: data.user.company_address2 || address2 || '',
          logoUrl: data.user.logo_url || '',
          logoAlign: data.user.logo_align || 'left',
          salesman: data.user.salesman || '',
          role: data.user.role || (isLoginAdmin ? 'admin' : 'user'), // Assign role admin
          subscription: data.user.subscription || { 
              expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), 
              quotaUsed: 0, 
              quotaMax: 500 
          }
        };
        onLogin(mappedUser);
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch {
      // Fallback lokal jika API belum ready
      onLogin({ 
        id: Date.now().toString(),
        fullname: isLoginAdmin ? 'Super Admin' : (fullName || 'User Biasa'), 
        email, 
        phone, 
        companyName: '', companyReg: '', companyAddress1: '', companyAddress2: '', salesman: fullName, logoUrl: '', logoAlign: 'left',
        role: isLoginAdmin ? 'admin' : 'user', // Set local role
        subscription: { 
            expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), 
            quotaUsed: 0, 
            quotaMax: 500 
        }
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-indigo-600 p-6 text-center text-white">
          <h2 className="text-base md:text-lg font-extrabold">DIK-APPS POS</h2>
        </div>
        <div className="p-6">
          <h3 className="text-sm md:text-base font-bold text-slate-800 mb-4 text-center">
            {authMode === 'login' ? 'Sign In to Account' : 'Register New Account'}
          </h3>
          <form onSubmit={handleAuth} className="space-y-3">
            {authMode === 'register' && (
              <>
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label><input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" /></div>
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone (+60)</label><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" /></div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@dik-apps.com untuk masuk admin" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" />
            </div>
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" /></div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-md mt-4">
              {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Register')}
            </button>
          </form>
          <div className="mt-4 pt-3 border-t text-center text-xs text-slate-500">
            {authMode === 'login' ? <button onClick={() => setAuthMode('register')} className="text-indigo-600 font-bold">Register here</button> : <button onClick={() => setAuthMode('login')} className="text-indigo-600 font-bold">Sign In</button>}
          </div>
        </div>
      </div>
    </div>
  );
}