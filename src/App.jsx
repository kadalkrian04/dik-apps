import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileEdit, Plus, Printer, 
  Smartphone, Eye, Trash2, DollarSign, Activity,
  BarChart3, FileSpreadsheet, Download, 
  LogOut, User, CheckCircle, ShieldCheck, Building2, Lock, Mail, Phone, Image as ImageIcon
} from 'lucide-react';

export default function CashSalesApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dik_auth') === 'true';
  });
  const [authMode, setAuthMode] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('dik_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: null,
      fullname: '',
      email: '',
      phone: '',
      role: 'Store Manager',
      salesman: '',
      companyName: '',
      companyReg: '',
      companyAddress1: '',
      companyAddress2: '',
      logoUrl: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('dik_auth', isAuthenticated);
    if (currentUser && currentUser.email) {
      localStorage.setItem('dik_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dik_user');
    }
  }, [isAuthenticated, currentUser]);

  const [activeTab, setActiveTab] = useState('sales');

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

    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerFax: '',
    customerGst: '',
    paymentMethod: 'CASH',
    
    docTitle: 'CASH SALES',
    docNo: localStorage.getItem('dik_last_doc_no') || '',
    docDate: getTodayDate(),
    salesman: currentUser.salesman || currentUser.fullname || 'Admin',
    pageInfo: 'Page 1 of 1',
    
    remarks: 'Goods sold are strictly non-refundable. Warranty claim requires this official receipt.',
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

  const handlePrintInvoice = () => {
    if (invoiceData.docNo) {
      localStorage.setItem('dik_last_doc_no', invoiceData.docNo);
    }
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen 
        authMode={authMode} 
        setAuthMode={setAuthMode} 
        onLogin={(user) => {
          if(user) setCurrentUser(user);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

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
      `}} />

      <nav className="no-print bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm md:text-base leading-tight">DIK-APPS STORE</h1>
            <p className="text-[10px] md:text-xs text-slate-500">Sabah POS System</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <TabButton icon={<LayoutDashboard size={16} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <TabButton icon={<FileEdit size={16} />} label="Cash Sales" isActive={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
          <TabButton icon={<BarChart3 size={16} />} label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <TabButton icon={<User size={16} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => { setIsAuthenticated(false); localStorage.clear(); }} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-red-200">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="no-print flex-1 overflow-auto relative p-3 md:p-6">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} currentUser={currentUser} />}
        {activeTab === 'sales' && (
          <SalesWorkspace 
            invoiceData={invoiceData} setInvoiceData={setInvoiceData}
            items={items} setItems={setItems}
            subTotal={subTotal} totalAmount={totalAmount}
            handlePrint={handlePrintInvoice}
            calculateItemAmount={calculateItemAmount}
            formatCurrency={formatCurrency}
            numberToWords={numberToWords}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'profile' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} setInvoiceData={setInvoiceData} invoiceData={invoiceData} />}
      </main>

      <div className="hidden print-only print:block w-full absolute top-0 left-0 bg-white m-0 p-0 z-50">
        <A4Preview 
          invoiceData={invoiceData} items={items} 
          calculateItemAmount={calculateItemAmount} formatCurrency={formatCurrency} 
          subTotal={subTotal} totalAmount={totalAmount} numberToWords={numberToWords} 
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}>
      {icon} {label}
    </button>
  );
}

function SalesWorkspace({ 
  invoiceData, setInvoiceData, items, setItems, 
  subTotal, totalAmount, handlePrint, 
  calculateItemAmount, formatCurrency, numberToWords, currentUser 
}) {
  const [workspaceMode, setWorkspaceMode] = useState('form'); 
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToDB = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docNo: invoiceData.docNo,
          customerName: invoiceData.customerName,
          totalAmount: totalAmount,
          items: items,
          userId: currentUser.id
        })
      });
      const data = await res.json();
      if(data.success) {
        alert("Invoice successfully saved to database!");
        if (invoiceData.docNo) localStorage.setItem('dik_last_doc_no', invoiceData.docNo);
      } else {
        alert("Failed to save: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 gap-3">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button onClick={() => setWorkspaceMode('form')} className={`flex-1 sm:flex-initial px-4 py-2 flex items-center justify-center gap-2 text-xs md:text-sm font-semibold rounded-md transition-all ${workspaceMode === 'form' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
             <FileEdit size={16}/> Edit Form
           </button>
           <button onClick={() => setWorkspaceMode('preview')} className={`flex-1 sm:flex-initial px-4 py-2 flex items-center justify-center gap-2 text-xs md:text-sm font-semibold rounded-md transition-all ${workspaceMode === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
             <Eye size={16}/> A4 Preview
           </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSaveToDB} disabled={isSaving} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save to DB'}
          </button>
          <button onClick={handlePrint} className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      <div>
        {workspaceMode === 'form' ? (
          <SalesForm 
            invoiceData={invoiceData} setInvoiceData={setInvoiceData}
            items={items} setItems={setItems} subTotal={subTotal} totalAmount={totalAmount}
          />
        ) : (
          <div className="flex justify-center bg-slate-200 p-3 md:p-8 rounded-xl shadow-inner overflow-x-auto">
            <div className="pointer-events-none origin-top shadow-2xl bg-white">
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

function SalesForm({ invoiceData, setInvoiceData, items, setItems, subTotal, totalAmount }) {
  const handleDataChange = (field, value) => setInvoiceData({ ...invoiceData, [field]: value });
  const handleItemChange = (id, field, value) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
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
           <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                 <input type="checkbox" id="showLogo" checked={invoiceData.showLogo} onChange={(e) => handleDataChange('showLogo', e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
                 <label htmlFor="showLogo" className="text-sm font-bold text-slate-700 cursor-pointer">Display Logo on Invoice</label>
              </div>
              <p className="text-xs text-slate-500 max-w-md">Toggle to show or hide the store logo on the printed invoice. <b>To change the logo, go to the Profile tab.</b></p>
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
                <select value={invoiceData.paymentMethod} onChange={(e) => handleDataChange('paymentMethod', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-medium">
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
                  <div className="md:col-span-5">
                    <InputGroup label="Description" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} />
                  </div>
                  <div className="md:col-span-4">
                    <InputGroup label="IMEI / Serial Number" value={item.imei} onChange={(e) => handleItemChange(item.id, 'imei', e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select value={item.status} onChange={(e) => handleItemChange(item.id, 'status', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-medium">
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
                      <select value={item.uom} onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm">
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
             <textarea rows="3" value={invoiceData.remarks} onChange={(e) => handleDataChange('remarks', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs md:text-sm outline-none resize-none" />
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
    <div className="w-[210mm] min-h-[297mm] bg-white text-black font-sans box-border relative mx-auto px-[40px] pt-[40px] pb-[20px] flex flex-col leading-snug">
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-start max-w-[65%]">
          {invoiceData.showLogo && invoiceData.logoUrl && (
             <img src={invoiceData.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-[12px] font-bold uppercase mb-0.5">{invoiceData.companyName}</h1>
            <p className="text-[10px]">{invoiceData.companyReg}</p>
            <p className="text-[10px] whitespace-pre-line">{invoiceData.companyAddress1}<br/>{invoiceData.companyAddress2}</p>
          </div>
        </div>
        <div className="border-[1.5px] border-black px-10 py-1.5 font-bold text-[13px] uppercase tracking-wide">
          {invoiceData.docTitle}
        </div>
      </div>

      <div className="flex justify-between mb-4 text-[10px]">
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

      <table className="w-full text-[11px] mb-4 border-collapse">
        <thead>
          <tr className="border-y-[1.6px] border-black">
            <th className="py-1 text-left font-bold w-[38%]">Item Description</th>
            <th className="py-1 text-center font-bold w-[9%]">Status</th>
            <th className="py-1 text-center font-bold w-[17%]">Warranty</th>
            <th className="py-1 text-center font-bold w-[12%]">QuantityUom</th>
            <th className="py-1 text-right font-bold w-[8%]">Unit Price</th>
            <th className="py-1 text-right font-bold w-[7%]">Discount</th>
            <th className="py-1 text-right font-bold w-[9%]">Amount</th>
          </tr>
        </thead>
        <tbody className="border-b-[1.6px] border-black">
          {items.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-100 border-dashed last:border-none">
              <td className="py-1.6 align-top pr-1">
                <div className="flex gap-2">
                  <span className="w-3">{index + 1}</span>
                  <div>
                    <div className="font-semibold leading-tight">{item.desc || '-'}</div>
                    {item.imei && item.imei !== '-' && <div className="text-[8.5px] mt-0.5 text-gray-700 font-medium">SN/IMEI: {item.imei}</div>}
                  </div>
                </div>
              </td>
              <td className="py-1.5 align-top text-center font-bold">{item.status}</td>
              <td className="py-1.5 align-top text-center text-[9px] text-gray-700 px-1">{item.warranty || '-'}</td>
              <td className="py-1.5 align-top text-center">{item.qty} &nbsp; {item.uom}</td>
              <td className="py-1.5 align-top text-right">{formatCurrency(item.price)}</td>
              <td className="py-1.5 align-top text-right">{formatCurrency(item.discount)}</td>
              <td className="py-1.5 align-top text-right">{formatCurrency(calculateItemAmount(item))}</td>
            </tr>
          ))}
          <tr style={{ height: '10px' }}><td colSpan="7"></td></tr>
        </tbody>
      </table>

      <div className="flex justify-between text-[10px] mt-1 mb-8">
        <div className="w-[60%] pr-6">
          <p className="mb-2">
            <span className="font-bold">Malaysia Ringgit</span><span> &nbsp;&nbsp;{numberToWords(totalAmount)}</span>
          </p>
          <p className="font-bold mb-0.5">Remark:</p>
          <p className="text-[9px] leading-tight text-gray-700">{invoiceData.remarks}</p>
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
          <div className="border-t-[1.5px] border-black border-b-[2px] border-black py-1 mt-1 flex justify-between font-bold text-[11px]">
            <span>Total Amount:</span>
            <span className="w-24 text-right flex justify-between">
              <span>MYR</span>
              <span>{formatCurrency(totalAmount)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER SIGNATURES - Spaced dynamically based on content (Removed mt-auto, added pt-24) */}
      <div className="pt-24 flex justify-between text-[10px] w-full pb-4">
        <div className="w-[42%]">
          <div className="border-t-[1.5px] border-black pt-1.5 font-bold uppercase">{invoiceData.companyName}</div>
        </div>
        <div className="w-[42%]">
          <div className="border-t-[1.5px] border-black pt-1.5">
            <p className="font-bold">Company Chop Signature</p>
            <p className="mt-0.5">Name: {invoiceData.customerName || '-'}</p>
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
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setRecentSales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <StatCard title="TOTAL SALES (TODAY)" value="MYR 12,801.00" sub="+14.2% vs yesterday" icon={<DollarSign size={20}/>} color="emerald" />
        <StatCard title="RECEIPTS ISSUED" value={`${recentSales.length} Bills`} sub="Latest synced" icon={<FileSpreadsheet size={20}/>} color="blue" />
        <StatCard title="DEVICES SOLD" value="4 Units" sub="New & Second" icon={<Smartphone size={20}/>} color="indigo" />
        <StatCard title="AVG TRANSACTION" value="MYR 3,200.25" sub="Basket size average" icon={<Activity size={20}/>} color="purple" />
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
                <th className="px-4 md:px-6 py-3">Customer</th>
                <th className="px-4 md:px-6 py-3">Items</th>
                <th className="px-4 md:px-6 py-3 text-right">Amount (MYR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4 text-slate-500 text-xs">Loading database records...</td></tr>
              ) : recentSales.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-slate-500 text-xs">No saved receipts yet</td></tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 md:px-6 py-3 font-bold text-slate-800 text-xs md:text-sm">{sale.doc_no}</td>
                    <td className="px-4 md:px-6 py-3 text-slate-700 text-xs md:text-sm">{sale.customer_name}</td>
                    <td className="px-4 md:px-6 py-3 text-slate-500 text-xs">{sale.items ? sale.items.length : 0} items</td>
                    <td className="px-4 md:px-6 py-3 text-right font-bold text-slate-800 text-xs md:text-sm">{sale.total_amount}</td>
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

function ReportsView() {
  const exportToExcel = () => alert("Exporting to Excel...");
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800">Financial Reports</h2>
          <p className="text-xs md:text-sm text-slate-500">Sales Statements</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={exportToExcel} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <Download size={14} /> Excel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 md:p-6 rounded-xl">
            <p className="text-xs font-bold text-indigo-500 mb-1">Total Sales Income</p>
            <h4 className="text-xl md:text-2xl font-extrabold text-indigo-900">MYR 12,801.00</h4>
          </div>
      </div>
    </div>
  );
}

function ProfileView({ currentUser, setCurrentUser, setInvoiceData, invoiceData }) {
  const [formData, setFormData] = useState(currentUser);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

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
          salesman: data.user.salesman || formData.salesman
        };
        setCurrentUser(mappedUser);
        setInvoiceData({
          ...invoiceData,
          companyName: mappedUser.companyName,
          companyReg: mappedUser.companyReg,
          companyAddress1: mappedUser.companyAddress1,
          companyAddress2: mappedUser.companyAddress2,
          logoUrl: mappedUser.logoUrl || ''
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
        logoUrl: formData.logoUrl || ''
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
          <p className="text-xs text-slate-500 font-medium">{formData.role} • DIK-APPS</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <ShieldCheck size={20} className="text-indigo-600" /> Personal & Store Details
        </h3>
        {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2"><CheckCircle size={16} /> Update Saved!</div>}

        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-6 items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
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
            <div>
              <h4 className="text-sm font-bold text-slate-800">Store Logo</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Upload your company logo here. It will be saved to your profile and automatically applied to all new invoices you create.</p>
              {formData.logoUrl && (
                <button type="button" onClick={() => setFormData({...formData, logoUrl: ''})} className="text-xs text-red-500 font-bold hover:underline mt-2">
                  Remove Logo
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input type="text" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salesman / Attendant Name</label>
              <input type="text" value={formData.salesman} onChange={e => setFormData({...formData, salesman: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number (+60)</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Position</label>
              <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm outline-none font-medium" />
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
          salesman: data.user.salesman || ''
        };
        onLogin(mappedUser);
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch {
      onLogin({ 
        id: Date.now().toString(),
        fullname: fullName || 'Admin DIK-APPS', email, phone, 
        companyName, companyReg, companyAddress1: address1, companyAddress2: address2, salesman: fullName, logoUrl: '' 
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
            <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs" /></div>
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