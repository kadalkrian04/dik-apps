import React, { useState, useEffect } from 'react';

// FUNGSI KONVERSI ANGKA KE HURUF (MALAYSIA RINGGIT)
function numberToWords(number) {
  if (number === 0) return 'Zero Only';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertGroup(n) {
    let word = '';
    if (n > 99) {
      word += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 9 && n < 20) {
      word += teens[n - 10] + ' ';
    } else {
      if (n > 19) {
        word += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        word += units[n] + ' ';
      }
    }
    return word;
  }

  let words = '';
  const numInt = Math.floor(number);
  if (numInt > 999) {
    words += convertGroup(Math.floor(numInt / 1000)) + 'Thousand ';
    words += convertGroup(numInt % 1000);
  } else {
    words += convertGroup(numInt);
  }
  
  return words.trim() + ' Only';
}

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // Default Dashboard
  
  // State Login / Register
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State Profile
  const [profileForm, setProfileForm] = useState({});

  // State Invoice
  const [customerName, setCustomerName] = useState('');
  const [address1, setAddress1] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [gstReg, setGstReg] = useState('');
  
  const [docNo, setDocNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [pageInfo, setPageInfo] = useState('Page 1 of 1');
  
  const [items, setItems] = useState([]);
  
  // Efek saat komponen dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem('dikapps_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setProfileForm(parsedUser);
    }
    
    // Set tanggal default hari ini (format DD/MM/YYYY)
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setInvoiceDate(formattedDate);

    // Ambil doc number terakhir dari localStorage
    const lastDocNo = localStorage.getItem('dikapps_last_doc_no');
    if (lastDocNo) setDocNo(lastDocNo);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    try {
      const mode = isLogin ? 'login' : 'register';
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, ...authForm })
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setProfileForm(data.user);
        localStorage.setItem('dikapps_user', JSON.stringify(data.user));
        setActiveTab('dashboard'); // Arahkan ke dashboard setelah login
      } else {
        setAuthError(data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      setAuthError('Gagal terhubung ke server database.');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dikapps_user');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, logo_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'update_profile', ...profileForm })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('dikapps_user', JSON.stringify(data.user));
        alert('Profil berhasil diperbarui!');
      }
    } catch (err) {
      alert('Gagal update profil');
    }
    setIsLoading(false);
  };

  const addItem = () => {
    setItems([...items, { description: '', imei: '', status: 'NEW', warranty: '', qty: 1, uom: 'UNIT', price: 0, discount: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Kalkulasi Total
  const subTotal = items.reduce((acc, item) => acc + (parseFloat(item.price || 0) * parseInt(item.qty || 1)), 0);
  const totalDiscount = items.reduce((acc, item) => acc + parseFloat(item.discount || 0), 0);
  const totalAmount = subTotal - totalDiscount;

  const handlePrint = () => {
    if (docNo) localStorage.setItem('dikapps_last_doc_no', docNo);
    window.print();
  };

  // LAYOUT: HALAMAN LOGIN / REGISTER
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">DIK-APPS STORE</h2>
          <h3 className="text-lg font-semibold text-center mb-4">{isLogin ? 'Login ke Akun Anda' : 'Daftar Akun Baru'}</h3>
          
          {authError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{authError}</div>}
          
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                <input type="text" placeholder="Phone Number (+60...)" className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
              </>
            )}
            <input type="email" placeholder="Email Address" required className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded transition-colors">
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>{isLogin ? "Belum punya akun?" : "Sudah punya akun?"}</p>
            <button onClick={() => { setIsLogin(!isLogin); setAuthError(''); }} className="text-blue-600 font-bold hover:underline mt-1">
              {isLogin ? 'Register di sini' : 'Login di sini'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT: DASHBOARD / MAIN APP
  return (
    <div className="min-h-screen bg-gray-50 print:bg-white text-gray-800 font-sans">
      
      {/* INJECT CSS UNTUK PRINT */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          .print-hide { display: none !important; }
        }
      `}</style>

      {/* NAVBAR (Disembunyikan saat print) */}
      <nav className="bg-white border-b p-4 flex flex-wrap justify-between items-center print-hide shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-700 text-white p-2 rounded font-bold">DIK</div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase">{user.company_name || 'DIK-APPS STORE'}</h1>
            <p className="text-xs text-gray-500">DIK-APPS POS System</p>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto my-2 md:my-0">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('cash_sales')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'cash_sales' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Cash Sales</button>
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Profile</button>
        </div>

        <button onClick={logout} className="text-red-600 font-medium hover:bg-red-50 px-4 py-2 rounded-lg text-sm border border-red-200">Logout</button>
      </nav>

      {/* TAB: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="p-6 max-w-5xl mx-auto print-hide space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h2>
              <p className="text-gray-500">Manage your POS, invoices, and settings here.</p>
            </div>
            <button onClick={() => setActiveTab('cash_sales')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all">
              + Create New Invoice
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <p className="text-sm text-gray-500 font-bold mb-1">COMPANY NAME</p>
              <p className="text-lg font-semibold truncate">{user.company_name || '-'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <p className="text-sm text-gray-500 font-bold mb-1">SALESMAN ASSIGNED</p>
              <p className="text-lg font-semibold">{user.salesman || '-'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <p className="text-sm text-gray-500 font-bold mb-1">ROLE</p>
              <p className="text-lg font-semibold">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROFILE */}
      {activeTab === 'profile' && (
        <div className="p-6 max-w-3xl mx-auto print-hide">
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
            <h2 className="text-xl font-bold mb-6 border-b pb-2">Store Profile & Invoice Settings</h2>
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">COMPANY NAME</label>
                  <input type="text" className="w-full border p-2 rounded text-sm uppercase" value={profileForm.company_name || ''} onChange={e => setProfileForm({...profileForm, company_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">SSM REG NO</label>
                  <input type="text" className="w-full border p-2 rounded text-sm" value={profileForm.company_reg || ''} onChange={e => setProfileForm({...profileForm, company_reg: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ADDRESS 1</label>
                  <input type="text" className="w-full border p-2 rounded text-sm" value={profileForm.company_address1 || ''} onChange={e => setProfileForm({...profileForm, company_address1: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ADDRESS 2</label>
                  <input type="text" className="w-full border p-2 rounded text-sm" value={profileForm.company_address2 || ''} onChange={e => setProfileForm({...profileForm, company_address2: e.target.value})} />
                </div>
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1 text-blue-600">ATTENDANT / SALESMAN NAME (Appears on Signature)</label>
                  <input type="text" className="w-full border p-2 rounded text-sm uppercase font-semibold bg-blue-50" placeholder="E.g. CLARICE BINTI JAM" value={profileForm.salesman || ''} onChange={e => setProfileForm({...profileForm, salesman: e.target.value})} />
                </div>
              </div>

              <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">COMPANY LOGO UPLOAD</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm border p-1 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">LOGO ALIGNMENT ON INVOICE</label>
                  <select className="w-full border p-2 rounded text-sm" value={profileForm.logo_align || 'left'} onChange={e => setProfileForm({...profileForm, logo_align: e.target.value})}>
                    <option value="left">Left (Kiri)</option>
                    <option value="center">Center (Tengah)</option>
                  </select>
                </div>
                {profileForm.logo_url && (
                  <div className="md:col-span-2 bg-gray-50 p-2 border rounded">
                    <p className="text-xs text-gray-500 mb-2">Logo Preview:</p>
                    <img src={profileForm.logo_url} alt="Logo Preview" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-4 text-right">
                <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">
                  {isLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: CASH SALES (FORM + INVOICE PREVIEW) */}
      {activeTab === 'cash_sales' && (
        <div className="p-4 md:p-6 print-hide">
          <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
            
            {/* FORM EDITOR */}
            <div className="w-full lg:w-5/12 space-y-4 max-h-[85vh] overflow-y-auto pr-2 pb-20">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 py-2 z-10 border-b">
                <h2 className="text-xl font-bold text-blue-800">Invoice Data Entry</h2>
                <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-bold text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Export PDF
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="font-bold text-sm text-gray-700 mb-3 border-b pb-1">CUSTOMER DETAILS</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Customer Name" className="w-full border p-2 rounded text-sm uppercase" value={customerName} onChange={e=>setCustomerName(e.target.value)}/>
                  <input type="text" placeholder="Address" className="w-full border p-2 rounded text-sm" value={address1} onChange={e=>setAddress1(e.target.value)}/>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Phone No." className="w-full border p-2 rounded text-sm" value={phone} onChange={e=>setPhone(e.target.value)}/>
                    <input type="text" placeholder="Fax" className="w-full border p-2 rounded text-sm" value={fax} onChange={e=>setFax(e.target.value)}/>
                  </div>
                  <input type="text" placeholder="GST Reg #" className="w-full border p-2 rounded text-sm" value={gstReg} onChange={e=>setGstReg(e.target.value)}/>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="font-bold text-sm text-gray-700 mb-3 border-b pb-1">DOCUMENT SETTINGS</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500">Document No</label><input type="text" className="w-full border p-2 rounded text-sm uppercase" value={docNo} onChange={e=>setDocNo(e.target.value)}/></div>
                  <div><label className="text-xs text-gray-500">Date (DD/MM/YYYY)</label><input type="text" className="w-full border p-2 rounded text-sm" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)}/></div>
                  <div><label className="text-xs text-gray-500">Page Info</label><input type="text" className="w-full border p-2 rounded text-sm" value={pageInfo} onChange={e=>setPageInfo(e.target.value)}/></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center mb-3 border-b pb-1">
                  <h3 className="font-bold text-sm text-gray-700">ITEMS ({items.length})</h3>
                  <button onClick={addItem} className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-2 py-1 rounded">+ Add Line</button>
                </div>
                
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border relative group">
                      <button onClick={() => removeItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-white rounded shadow text-xs">Del</button>
                      <div className="grid grid-cols-12 gap-2 text-sm mt-4">
                        <div className="col-span-12"><label className="text-[10px] text-gray-500">Description</label><input type="text" className="w-full border p-1 rounded" value={item.description} onChange={e=>updateItem(index, 'description', e.target.value)}/></div>
                        <div className="col-span-8"><label className="text-[10px] text-gray-500">IMEI/SN</label><input type="text" className="w-full border p-1 rounded" value={item.imei} onChange={e=>updateItem(index, 'imei', e.target.value)}/></div>
                        <div className="col-span-4"><label className="text-[10px] text-gray-500">Status</label>
                          <select className="w-full border p-1 rounded" value={item.status} onChange={e=>updateItem(index, 'status', e.target.value)}>
                            <option value="NEW">NEW</option>
                            <option value="SECOND">SECOND</option>
                            <option value="USED">USED</option>
                          </select>
                        </div>
                        <div className="col-span-6"><label className="text-[10px] text-gray-500">Warranty</label><input type="text" className="w-full border p-1 rounded" value={item.warranty} onChange={e=>updateItem(index, 'warranty', e.target.value)}/></div>
                        <div className="col-span-3"><label className="text-[10px] text-gray-500">Qty</label><input type="number" className="w-full border p-1 rounded" value={item.qty} onChange={e=>updateItem(index, 'qty', e.target.value)}/></div>
                        <div className="col-span-3"><label className="text-[10px] text-gray-500">Uom</label>
                          <select className="w-full border p-1 rounded" value={item.uom} onChange={e=>updateItem(index, 'uom', e.target.value)}>
                            <option value="UNIT">UNIT</option><option value="PCS">PCS</option><option value="BOX">BOX</option><option value="LGT">LGT</option>
                          </select>
                        </div>
                        <div className="col-span-6"><label className="text-[10px] text-gray-500">Price (MYR)</label><input type="number" className="w-full border p-1 rounded" value={item.price} onChange={e=>updateItem(index, 'price', e.target.value)}/></div>
                        <div className="col-span-6"><label className="text-[10px] text-gray-500">Disc (MYR)</label><input type="number" className="w-full border p-1 rounded" value={item.discount} onChange={e=>updateItem(index, 'discount', e.target.value)}/></div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No items added yet.</p>}
                </div>
              </div>
            </div>

            {/* LIVE A4 INVOICE PREVIEW (Di-print melalui ini) */}
            <div className="w-full lg:w-7/12 flex justify-center">
              <div id="printable-invoice" className="bg-white shadow-xl w-full max-w-[794px] min-h-[1123px] relative text-black" style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", padding: "40px" }}>
                
                {/* Header Logo (Bisa Kiri atau Tengah) */}
                {user.logo_url && (
                  <div className={`mb-3 flex ${user.logo_align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <img src={user.logo_url} alt="Company Logo" className="h-[70px] object-contain" />
                  </div>
                )}

                {/* Info Perusahaan & Judul Dokumen */}
                <div className="flex justify-between items-start mb-6">
                  <div className="leading-tight">
                    <h1 className="font-bold text-[13px] uppercase tracking-wide">{user.company_name || 'COMPANY NAME'}</h1>
                    <p>{user.company_reg || 'REG NO'}</p>
                    <p>{user.company_address1}</p>
                    <p>{user.company_address2}</p>
                  </div>
                  <div className="border border-black px-6 py-1">
                    <h2 className="font-bold text-[14px]">CASH SALES</h2>
                  </div>
                </div>

                {/* Kustomer dan Detail Invoice Side by Side */}
                <div className="flex justify-between mb-4">
                  <div className="w-[55%]">
                    <div className="flex"><div className="w-20 font-bold">NAME:</div><div className="uppercase font-bold">{customerName || '-'}</div></div>
                    <div className="flex"><div className="w-20 font-bold">ADDRESS:</div><div className="uppercase">{address1 || '-'}</div></div>
                    <div className="flex items-center">
                      <div className="w-20 font-bold">PHONE:</div><div className="w-32">{phone || '-'}</div>
                      <div className="w-10 font-bold ml-2">FAX :</div><div>{fax || '-'}</div>
                    </div>
                    <div className="flex"><div className="w-20 font-bold">GST Reg #</div><div>{gstReg || '-'}</div></div>
                  </div>
                  
                  <div className="w-[40%]">
                    <div className="flex"><div className="w-32 font-bold">DOCUMENT NO</div><div className="uppercase">{docNo || '-'}</div></div>
                    <div className="flex"><div className="w-32 font-bold">DATE</div><div>{invoiceDate}</div></div>
                    <div className="flex"><div className="w-32 font-bold">SALESMAN</div><div className="uppercase">{user.salesman || user.name || '-'}</div></div>
                    <div className="flex"><div className="w-32 font-bold">PAGE</div><div>{pageInfo}</div></div>
                  </div>
                </div>

                {/* Tabel Item - Border Tebal Hitam */}
                <table className="w-full border-collapse border-y-2 border-black mb-6">
                  <thead>
                    <tr className="border-b border-black leading-relaxed">
                      <th className="py-1 text-left w-[40%]">Item Description</th>
                      <th className="py-1 text-center w-[10%]">Status</th>
                      <th className="py-1 text-center w-[15%]">Warranty</th>
                      <th className="py-1 text-center w-[10%]">Quantity Uom</th>
                      <th className="py-1 text-right w-[10%]">Unit Price</th>
                      <th className="py-1 text-right w-[7%]">Discount</th>
                      <th className="py-1 text-right w-[12%]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className={`${idx !== items.length -1 ? 'border-b border-gray-300 border-dotted' : ''} align-top`}>
                        <td className="py-2 pr-2">
                          <div>{idx + 1}&nbsp;&nbsp;&nbsp;{item.description || '-'}</div>
                          {item.imei && <div className="text-[9px] text-gray-600 pl-4 mt-1">SN/IMEI: {item.imei}</div>}
                        </td>
                        <td className="py-2 text-center font-bold">{item.status}</td>
                        <td className="py-2 text-center text-gray-600 text-[10px] leading-tight px-1">{item.warranty || '-'}</td>
                        <td className="py-2 text-center">{item.qty} {item.uom}</td>
                        <td className="py-2 text-right">{parseFloat(item.price || 0).toFixed(2)}</td>
                        <td className="py-2 text-right">{parseFloat(item.discount || 0).toFixed(2)}</td>
                        <td className="py-2 text-right">{( (parseFloat(item.price||0) * parseInt(item.qty||1)) - parseFloat(item.discount||0) ).toFixed(2)}</td>
                      </tr>
                    ))}
                    {items.length === 0 && <tr><td colSpan="7" className="py-6 text-center text-gray-400">No items</td></tr>}
                  </tbody>
                </table>

                {/* Area Ringkasan Total & Tanda Tangan */}
                {/* Dibungkus flex-col agar Tanda Tangan selalu mengikuti di bawah Total secara dinamis */}
                <div className="flex flex-col gap-12 mt-4">
                  
                  {/* Blok Total & Ringgit Words */}
                  <div className="flex justify-between items-start border-t-2 border-black pt-2">
                    <div className="w-[60%] pr-4">
                      <p><span className="font-bold">Malaysia Ringgit</span> &nbsp;{numberToWords(totalAmount)}</p>
                      <p className="font-bold mt-3 text-[10px]">Remark:</p>
                      <p className="text-[10px] text-gray-600">Goods sold are strictly non-refundable. Warranty claim requires this official receipt.</p>
                    </div>
                    
                    <div className="w-[35%]">
                      <div className="flex justify-between mb-1"><span className="text-gray-600">Sub Total:</span><span>{subTotal.toFixed(2)}</span></div>
                      <div className="flex justify-between mb-1"><span className="text-gray-600">Discount:</span><span>{totalDiscount.toFixed(2)}</span></div>
                      <div className="flex justify-between mb-1 border-b border-black pb-1"><span className="text-gray-600">Round cent:</span><span>0.00</span></div>
                      <div className="flex justify-between items-center pt-1 font-bold">
                        <span>Total Amount:</span>
                        <span className="flex gap-4"><span>MYR</span> <span>{totalAmount.toFixed(2)}</span></span>
                      </div>
                      <div className="border-b-2 border-black mt-1"></div>
                    </div>
                  </div>

                  {/* Blok Tanda Tangan (Akan otomatis turun mengikuti tinggi konten di atasnya) */}
                  <div className="flex justify-between mt-10">
                    <div className="w-[45%] border-t border-black pt-1">
                      <p className="font-bold uppercase tracking-wide">{user.company_name || 'COMPANY NAME'}</p>
                    </div>
                    
                    <div className="w-[45%] border-t border-black pt-1">
                      <p className="font-bold">Company Chop Signature</p>
                      <p className="mt-1">Name: {customerName || '__________________________'}</p>
                      <p>Date: {invoiceDate}</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}