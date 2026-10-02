import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileEdit, Plus, Printer, 
  Smartphone, Eye, Trash2, Search, DollarSign, Activity,
  BarChart3, FileSpreadsheet, Download, LogOut, User, Lock, Mail, Phone,
  Filter
} from 'lucide-react';

export default function CashSalesApp() {
  // ================= AUTH STATE =================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Main Navigation State: 'dashboard', 'sales', 'reports'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State untuk mengontrol apa yang sedang di-print (menghindari konflik CSS)
  const [printMode, setPrintMode] = useState('none'); // 'none', 'invoice', 'report'

  // ================= INVOICE STATE =================
  const [invoiceData, setInvoiceData] = useState({
    companyName: 'YUNG SIANG ENTERPRISE SDN BHD',
    companyReg: 'Reg No.198701008364 Company No 167082-D',
    companyAddress1: 'P.O. BOX 38, 89727, KG LAMPUAS, MEMBAKUT',
    companyAddress2: 'SABAH, MALAYSIA',
    
    customerName: 'CASH CUSTOMER',
    customerAddress: '-',
    customerPhone: '+60 11-2345 6789',
    paymentMethod: 'CASH',
    customerFax: '-',
    customerGst: '-',
    
    docTitle: 'CASH SALES',
    docNo: 'H01C-1835193',
    docDate: new Date().toLocaleDateString('en-GB'),
    salesman: 'CLARICE BINTI JAM',
    pageInfo: 'Page 1 of 1',
    
    remarks: 'Goods sold are strictly non-refundable. Warranty claim requires this official receipt.',
    discountTotal: 0,
    roundCent: 0,
  });

  const [items, setItems] = useState([
    { id: 1, desc: 'iPhone 15 Pro 128GB - Natural Titanium', imei: '354892110293841 / SN: F2LQ99XX', status: 'NEW', warranty: '1 Year Apple Official Warranty', qty: 1, uom: 'UNIT', price: 4299.00, discount: 0 },
    { id: 2, desc: 'Anker 20W Fast Charger Type-C Adapter', imei: '-', status: 'NEW', warranty: '6 Months Replacement', qty: 2, uom: 'PCS', price: 65.00, discount: 0 }
  ]);

  // ================= CALCULATION LOGIC =================
  const calculateItemAmount = (item) => {
    return (parseFloat(item.qty || 0) * parseFloat(item.price || 0)) - parseFloat(item.discount || 0);
  };

  const subTotal = items.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  const totalAmount = subTotal - parseFloat(invoiceData.discountTotal || 0) - parseFloat(invoiceData.roundCent || 0);
  const formatCurrency = (val) => parseFloat(val || 0).toFixed(2);

  // Mock function to translate number to words (for demo purposes)
  const numberToWords = (amount) => {
    return "Four Thousand Four Hundred Twenty Nine Only"; 
  };

  // ================= PRINT HANDLERS =================
  const handlePrintInvoice = () => {
    setPrintMode('invoice');
    setTimeout(() => {
      window.print();
      setPrintMode('none');
    }, 300);
  };

  const handlePrintReport = () => {
    setPrintMode('report');
    setTimeout(() => {
      window.print();
      setPrintMode('none');
    }, 300);
  };

  // ================= MAIN RENDER =================
  if (!isAuthenticated) {
    return <AuthScreen authMode={authMode} setAuthMode={setAuthMode} onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col ${printMode !== 'none' ? `print-mode-${printMode}` : ''}`}>
      
      {/* GLOBAL PRINT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body, html { margin: 0; padding: 0; background-color: white !important; }
          body * { visibility: hidden; }
          
          /* INVOICE PRINT LOGIC */
          .print-mode-invoice .invoice-print-area, 
          .print-mode-invoice .invoice-print-area * { visibility: visible; }
          .print-mode-invoice .invoice-print-area {
            position: absolute; left: 0; top: 0;
            width: 210mm !important; height: 297mm !important;
            margin: 0 !important; box-shadow: none !important; border-radius: 0 !important;
          }

          /* REPORT PRINT LOGIC */
          .print-mode-report .report-print-area, 
          .print-mode-report .report-print-area * { visibility: visible; }
          .print-mode-report .report-print-area {
            position: absolute; left: 0; top: 0; width: 100%; padding: 20px; background: white;
          }
        }
      `}} />

      {/* TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Smartphone size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">YUNG SIANG ENTERPRISE</h1>
            <p className="text-xs text-slate-500">POS & Management System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <TabButton 
            icon={<LayoutDashboard size={16} />} label="Dashboard" 
            isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} 
          />
          <TabButton 
            icon={<FileEdit size={16} />} label="Sales Entry & Invoice" 
            isActive={activeTab === 'sales'} onClick={() => setActiveTab('sales')} 
          />
          <TabButton 
            icon={<BarChart3 size={16} />} label="Reports" 
            isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} 
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('sales')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={16} /> New Sale
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button onClick={() => setIsAuthenticated(false)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-red-200">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto relative">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        
        {activeTab === 'sales' && (
          <SalesWorkspace 
            invoiceData={invoiceData} setInvoiceData={setInvoiceData}
            items={items} setItems={setItems}
            subTotal={subTotal} totalAmount={totalAmount}
            handlePrint={handlePrintInvoice}
            calculateItemAmount={calculateItemAmount}
            formatCurrency={formatCurrency}
            numberToWords={numberToWords}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView handlePrintReport={handlePrintReport} />
        )}
      </main>
    </div>
  );
}

// ================= HELPER COMPONENTS =================
function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
        isActive 
          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, sub, icon, color }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-extrabold text-slate-800">{value}</h4>
        <p className="text-[11px] font-semibold text-slate-500 mt-1">{sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}

function TableRow({ bill, date, cust, phone, item, payment, amount, payColor }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <p className="font-bold text-slate-800 text-sm">{bill}</p>
        <p className="text-xs text-slate-500">{date}</p>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-slate-700 text-sm">{cust}</p>
        <p className="text-xs text-slate-500">{phone}</p>
      </td>
      <td className="px-6 py-4 max-w-[250px] truncate">
        <p className="font-medium text-slate-700 text-sm truncate">{item}</p>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${payColor}`}>
          {payment}
        </span>
      </td>
      <td className="px-6 py-4 text-right font-bold text-slate-800">
        {amount}
      </td>
    </tr>
  );
}

// ================= DASHBOARD COMPONENT =================
function DashboardView({ setActiveTab }) {
  // Tambahkan state untuk data dari database
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari Neon DB saat dashboard dibuka
  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setRecentSales(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load data", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 print:hidden animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex justify-between items-center shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-50 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sabah Branch Active - Sales Terminal Ready
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            Good Day, CLARICE <span className="text-3xl">👋</span>
          </h2>
          <p className="text-slate-500 mt-1">Quick overview of your mobile shop cash receipts, daily sales, and transaction logs.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={() => setActiveTab('sales')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all">
            <Plus size={18} /> New Receipt
          </button>
          <button onClick={() => setActiveTab('reports')} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all">
            <BarChart3 size={18} /> View Reports
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="TOTAL SALES (TODAY)" value="MYR 12,801.00" sub="+14.2% vs yesterday" icon={<DollarSign size={20}/>} color="emerald" />
        <StatCard title="RECEIPTS ISSUED" value="4 Bills" sub="Latest No: H01C-1835193" icon={<FileSpreadsheet size={20}/>} color="blue" />
        <StatCard title="DEVICES SOLD" value="4 Units" sub="2 New | 1 Used" icon={<Smartphone size={20}/>} color="indigo" />
        <StatCard title="AVG TRANSACTION" value="MYR 3,200.25" sub="Per customer basket size" icon={<Activity size={20}/>} color="purple" />
      </div>

      {/* Recent Receipts Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800">Recent Cash Sales Receipts</h3>
            <p className="text-xs text-slate-500">Data live dari Database Neon</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Bill No</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Items</th>
                <th className="px-6 py-4 text-right">Amount (MYR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4 text-slate-500">Loading data dari database...</td></tr>
              ) : recentSales.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-slate-500">Belum ada data penjualan</td></tr>
              ) : (
                recentSales.map((sale) => (
                  <TableRow 
                    key={sale.id}
                    bill={sale.doc_no} 
                    date={new Date(sale.date).toLocaleDateString()}
                    cust={sale.customer_name} 
                    phone="-"
                    item={`${sale.items ? sale.items.length : 0} items`}
                    payment="DB SAVED" 
                    amount={sale.total_amount} 
                    payColor="bg-emerald-100 text-emerald-700"
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= SALES ENTRY & PREVIEW COMPONENT =================
function SalesWorkspace({ 
  invoiceData, setInvoiceData, items, setItems, 
  subTotal, totalAmount, handlePrint, 
  calculateItemAmount, formatCurrency, numberToWords 
}) {
  const [workspaceMode, setWorkspaceMode] = useState('form'); 
  const [isSaving, setIsSaving] = useState(false);

  // Fungsi menyimpan ke Database Neon
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
          items: items
        })
      });
      const data = await res.json();
      if(data.success) {
        alert("Berhasil disimpan ke Database Neon!");
      } else {
        alert("Gagal: " + data.message);
      }
    } catch (err) {
      alert("Error koneksi!");
    }
    setIsSaving(false);
  };

  return (
    <div className="print:hidden p-6 max-w-6xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setWorkspaceMode('form')}
             className={`px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-md transition-all ${workspaceMode === 'form' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <FileEdit size={16}/> Edit Invoice Data
           </button>
           <button 
             onClick={() => setWorkspaceMode('preview')}
             className={`px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-md transition-all ${workspaceMode === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <Eye size={16}/> A4 Print Preview
           </button>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleSaveToDB} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
            {isSaving ? 'Menyimpan...' : 'Save to DB'}
          </button>
          {workspaceMode === 'preview' && (
             <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
               <Printer size={16} /> Print Document Now
             </button>
          )}
          {workspaceMode === 'form' && (
             <button onClick={() => setWorkspaceMode('preview')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
               Save & Preview <Eye size={16} />
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-24">
        {workspaceMode === 'form' ? (
          <SalesForm 
            invoiceData={invoiceData} setInvoiceData={setInvoiceData}
            items={items} setItems={setItems} subTotal={subTotal} totalAmount={totalAmount}
          />
        ) : (
          <div className="flex justify-center bg-slate-200 p-8 rounded-xl shadow-inner min-h-full">
            <A4Preview 
              invoiceData={invoiceData} items={items} 
              calculateItemAmount={calculateItemAmount} formatCurrency={formatCurrency} 
              subTotal={subTotal} totalAmount={totalAmount} numberToWords={numberToWords} 
            />
          </div>
        )}
      </div>

      {/* Hidden Print Wrapper */}
      <div className="invoice-print-area hidden">
        <A4Preview 
          invoiceData={invoiceData} items={items} 
          calculateItemAmount={calculateItemAmount} formatCurrency={formatCurrency} 
          subTotal={subTotal} totalAmount={totalAmount} numberToWords={numberToWords} 
        />
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
    <div className="space-y-6">
      <FormSection title="1. STORE PROFILE & LOGO">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <InputGroup label="Company Name" value={invoiceData.companyName} onChange={(e) => handleDataChange('companyName', e.target.value)} />
            <InputGroup label="SSM Reg No / Company No" value={invoiceData.companyReg} onChange={(e) => handleDataChange('companyReg', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Address Line 1" value={invoiceData.companyAddress1} onChange={(e) => handleDataChange('companyAddress1', e.target.value)} />
              <InputGroup label="Address Line 2" value={invoiceData.companyAddress2} onChange={(e) => handleDataChange('companyAddress2', e.target.value)} />
            </div>
          </div>
          <div className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-slate-50">
            <p className="text-sm font-medium text-slate-600 mb-3">Upload Store Logo (PNG/JPG)</p>
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-slate-100">Choose File</button>
          </div>
        </div>
      </FormSection>

      <div className="grid grid-cols-2 gap-6">
        <FormSection title="2. CUSTOMER DETAILS">
          <div className="space-y-4">
            <InputGroup label="Customer Name" value={invoiceData.customerName} onChange={(e) => handleDataChange('customerName', e.target.value)} />
            <InputGroup label="Address" value={invoiceData.customerAddress} onChange={(e) => handleDataChange('customerAddress', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Phone No." value={invoiceData.customerPhone} onChange={(e) => handleDataChange('customerPhone', e.target.value)} />
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Method</label>
                <select value={invoiceData.paymentMethod} onChange={(e) => handleDataChange('paymentMethod', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium shadow-sm">
                  <option>CASH</option>
                  <option>CREDIT CARD</option>
                  <option>DEBIT CARD</option>
                  <option>BANK TRANSFER</option>
                  <option>DUITNOW QR</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Fax" value={invoiceData.customerFax} onChange={(e) => handleDataChange('customerFax', e.target.value)} />
              <InputGroup label="GST / SST Reg #" value={invoiceData.customerGst} onChange={(e) => handleDataChange('customerGst', e.target.value)} />
            </div>
          </div>
        </FormSection>

        <FormSection title="3. DOCUMENT SETTINGS">
          <div className="space-y-4">
            <InputGroup label="Document Title" value={invoiceData.docTitle} onChange={(e) => handleDataChange('docTitle', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
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
            <div key={item.id} className="border border-slate-200 bg-slate-50 p-4 rounded-xl relative group">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">Item #{index + 1}</span>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  Remove Item <Trash2 size={12}/>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <InputGroup label="Product Description" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} />
                  </div>
                  <div className="col-span-4">
                    <InputGroup label="IMEI / Serial Number" value={item.imei} onChange={(e) => handleItemChange(item.id, 'imei', e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status / Condition</label>
                    <select value={item.status} onChange={(e) => handleItemChange(item.id, 'status', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium shadow-sm">
                      <option value="NEW">NEW</option>
                      <option value="USED - GRADE A">USED - GRADE A</option>
                      <option value="USED - GRADE B">USED - GRADE B</option>
                      <option value="REFURBISHED">REFURBISHED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-end">
                   <div className="col-span-4">
                      <InputGroup label="Warranty Terms" value={item.warranty} onChange={(e) => handleItemChange(item.id, 'warranty', e.target.value)} />
                   </div>
                   <div className="col-span-2">
                      <InputGroup label="Qty" type="number" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} align="center" />
                   </div>
                   <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">UOM</label>
                      <select value={item.uom} onChange={(e) => handleItemChange(item.id, 'uom', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium shadow-sm">
                        <option value="UNIT">UNIT</option>
                        <option value="PCS">PCS</option>
                        <option value="SET">SET</option>
                        <option value="LGT">LGT</option>
                      </select>
                   </div>
                   <div className="col-span-2">
                      <InputGroup label="Unit Price (MYR)" type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} align="right" />
                   </div>
                   <div className="col-span-2">
                      <InputGroup label="Discount (MYR)" type="number" value={item.discount} onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)} align="right" textColor="text-red-500" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="5. SUMMARY & REMARKS">
        <div className="flex gap-8">
          <div className="flex-1">
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Remarks / Terms</label>
             <textarea rows="4" value={invoiceData.remarks} onChange={(e) => handleDataChange('remarks', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 resize-none shadow-sm" />
          </div>
          <div className="w-[350px] bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 space-y-3 shadow-sm">
             <div className="flex justify-between items-center text-sm font-medium">
               <span>Sub Total:</span><span>MYR {subTotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-red-500 font-medium">Discount:</span>
               <div className="flex items-center gap-2">
                 <span className="text-red-500">- MYR</span>
                 <input type="number" value={invoiceData.discountTotal} onChange={(e) => handleDataChange('discountTotal', e.target.value)} className="w-20 bg-white border border-slate-300 rounded p-1 text-right text-slate-800 text-sm outline-none focus:border-indigo-400" />
               </div>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500">Round cent:</span>
               <input type="number" value={invoiceData.roundCent} onChange={(e) => handleDataChange('roundCent', e.target.value)} className="w-20 bg-white border border-slate-300 rounded p-1 text-right text-slate-800 text-sm outline-none focus:border-indigo-400" />
             </div>
             <div className="border-t border-slate-300 pt-3 mt-3 flex justify-between items-center">
               <span className="text-lg font-bold text-slate-800">Total Amount:</span>
               <span className="text-xl font-extrabold text-indigo-600">MYR {totalAmount.toFixed(2)}</span>
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
      <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text", align = "left", textColor = "text-slate-900" }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} className={`w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium shadow-sm transition-shadow ${textColor}`} style={{ textAlign: align }} />
    </div>
  );
}

function A4Preview({ invoiceData, items, calculateItemAmount, formatCurrency, subTotal, totalAmount, numberToWords }) {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl border border-slate-200 p-[40px_50px] box-border relative flex-shrink-0 text-black font-sans mx-auto">
      <div className="mb-8">
        <h1 className="text-[13px] font-bold uppercase">{invoiceData.companyName}</h1>
        <p className="text-[12px]">{invoiceData.companyReg}</p>
        <p className="text-[12px] whitespace-pre-line leading-snug">
          {invoiceData.companyAddress1}<br/>{invoiceData.companyAddress2}
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <div className="border border-black px-12 py-2 text-center font-bold text-lg uppercase tracking-wide min-w-[250px]">
          {invoiceData.docTitle}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-[12px] leading-tight">
        <div>
          <div className="flex mb-1">
            <span className="w-24 font-bold uppercase">NAME:</span>
            <span className="uppercase font-bold">{invoiceData.customerName}</span>
          </div>
          <div className="flex mb-1">
            <span className="w-24 font-bold uppercase">ADDRESS:</span>
            <span className="uppercase whitespace-pre-line">{invoiceData.customerAddress}</span>
          </div>
          <div className="flex mb-1 mt-4">
            <span className="w-24 font-bold uppercase">PHONE:</span>
            <span className="flex-1">{invoiceData.customerPhone}</span>
            <span className="w-12 font-bold uppercase">FAX</span>
            <span>: {invoiceData.customerFax}</span>
          </div>
          <div className="flex mb-1">
            <span className="w-24 font-bold uppercase">GST Reg #</span>
            <span>: {invoiceData.customerGst}</span>
          </div>
        </div>
        
        <div className="pl-12">
            <div className="flex mb-1">
            <span className="w-32 font-bold uppercase">DOCUMENT NO</span>
            <span>{invoiceData.docNo}</span>
          </div>
          <div className="flex mb-1">
            <span className="w-32 font-bold uppercase">DATE</span>
            <span>{invoiceData.docDate}</span>
          </div>
          <div className="flex mb-1">
            <span className="w-32 font-bold uppercase">SALESMAN</span>
            <span>{invoiceData.salesman}</span>
          </div>
          <div className="flex mb-1">
            <span className="w-32 font-bold uppercase">PAGE</span>
            <span>{invoiceData.pageInfo}</span>
          </div>
        </div>
      </div>

      <table className="w-full text-[11px] mb-8 border-collapse mt-4">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="py-1.5 text-left font-bold w-[4%]">Item</th>
            <th className="py-1.5 text-left font-bold w-[30%]">Description</th>
            <th className="py-1.5 text-center font-bold w-[10%]">Status</th>
            <th className="py-1.5 text-center font-bold w-[16%]">Warranty</th>
            <th className="py-1.5 text-center font-bold w-[6%]">Quantity</th>
            <th className="py-1.5 text-center font-bold w-[6%]">Uom</th>
            <th className="py-1.5 text-right font-bold w-[10%]">Unit Price</th>
            <th className="py-1.5 text-right font-bold w-[8%]">Discount</th>
            <th className="py-1.5 text-right font-bold w-[10%]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="py-2 align-top">{index + 1}</td>
              <td className="py-2 align-top">
                <div className="font-semibold">{item.desc}</div>
                {item.imei && item.imei !== '-' && <div className="text-[10px] mt-0.5 text-gray-700">SN/IMEI: {item.imei}</div>}
              </td>
              <td className="py-2 align-top text-center font-bold">{item.status}</td>
              <td className="py-2 align-top text-center text-[10px]">{item.warranty || '-'}</td>
              <td className="py-2 align-top text-center">{item.qty}</td>
              <td className="py-2 align-top text-center">{item.uom}</td>
              <td className="py-2 align-top text-right">{formatCurrency(item.price)}</td>
              <td className="py-2 align-top text-right">{formatCurrency(item.discount)}</td>
              <td className="py-2 align-top text-right">{formatCurrency(calculateItemAmount(item))}</td>
            </tr>
          ))}
          <tr style={{ height: '60px' }}><td colSpan="9"></td></tr>
        </tbody>
      </table>

      <div className="absolute bottom-[180px] left-[50px] right-[50px]">
          <div className="border-t-2 border-black pt-1.5 flex justify-between text-[12px]">
            <div className="flex gap-3">
              <span className="font-bold">Malaysia Ringgit</span>
              <span>{numberToWords(totalAmount)}</span>
            </div>
            <div className="flex w-[250px]">
              <span className="flex-1 text-right pr-4">Sub Total:</span>
              <span className="w-24 text-right">{formatCurrency(subTotal)}</span>
            </div>
          </div>

          <div className="flex justify-between text-[12px] mt-1.5">
            <div className="flex-1 pr-10">
              <span className="font-bold block mb-1">Remark:</span>
              <p className="whitespace-pre-line text-[11px] leading-tight">{invoiceData.remarks}</p>
            </div>
            <div className="w-[250px] space-y-1.5">
              <div className="flex">
                <span className="flex-1 text-right pr-4">Discount:</span>
                <span className="w-24 text-right">{formatCurrency(invoiceData.discountTotal)}</span>
              </div>
              <div className="flex">
                <span className="flex-1 text-right pr-4">Round cent:</span>
                <span className="w-24 text-right">{formatCurrency(invoiceData.roundCent)}</span>
              </div>
              <div className="border-t-2 border-black pt-1.5 flex font-bold mt-1.5">
                <span className="flex-1 text-right pr-4">Total Amount:</span>
                <span className="w-24 text-right flex justify-between">
                  <span>MYR</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </span>
              </div>
              <div className="border-b-2 border-black mt-1"></div>
            </div>
          </div>
      </div>

      <div className="absolute bottom-[50px] left-[50px] right-[50px] flex justify-between text-[12px]">
        <div className="w-[40%]">
          <div className="border-t border-black pt-1 font-bold">{invoiceData.companyName}</div>
        </div>
        <div className="w-[40%]">
            <div className="border-t border-black pt-1">
            <p>Company Chop Signature</p>
            <p className="mt-1">Name: {invoiceData.salesman}</p>
            <p className="mt-1">Date: {invoiceData.docDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= REPORTS COMPONENT =================
function ReportsView({ handlePrintReport }) {
  const [filterMode, setFilterMode] = useState('1month'); // '1month', '3month', '6month', '1year'
  
  // Dummy data based on filter
  const getReportData = () => {
    switch(filterMode) {
      case '3month': return { sales: 45200.00, expenses: 15400.00, profit: 29800.00, rows: 45 };
      case '6month': return { sales: 89000.00, expenses: 32000.00, profit: 57000.00, rows: 98 };
      case '1year': return { sales: 185000.00, expenses: 60000.00, profit: 125000.00, rows: 210 };
      default: return { sales: 12801.00, expenses: 3200.00, profit: 9601.00, rows: 12 };
    }
  };

  const data = getReportData();

  // Export to CSV Logic (Excel)
  const exportToExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Description,Type,Amount (MYR)\n"
      + "02/10/2026,Sales - iPhone 15 Pro,Income,4299.00\n"
      + "01/10/2026,Restock Inventory,Expense,-3200.00\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${filterMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Financial Reports</h2>
          <p className="text-sm text-slate-500">Sales and Expenses Overview</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['1month', '3month', '6month', '1year'].map(mode => (
              <button 
                key={mode} onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 text-xs font-bold rounded ${filterMode === mode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
              >
                {mode === '1month' ? '1 Month' : mode === '3month' ? '3 Months' : mode === '6month' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <button onClick={exportToExcel} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Download size={16} /> Excel (CSV)
          </button>
          <button onClick={handlePrintReport} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Printer size={16} /> Print PDF
          </button>
        </div>
      </div>

      {/* Report Print Area */}
      <div className="report-print-area space-y-6">
        <div className="hidden print:block mb-8">
           <h1 className="text-2xl font-bold text-slate-900">Financial Statement</h1>
           <p className="text-slate-500">Period: {filterMode} | Generated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
            <p className="text-sm font-bold text-indigo-500 mb-1">Total Sales Income</p>
            <h4 className="text-2xl font-extrabold text-indigo-900">MYR {data.sales.toFixed(2)}</h4>
          </div>
          <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
            <p className="text-sm font-bold text-red-500 mb-1">Total Expenses</p>
            <h4 className="text-2xl font-extrabold text-red-900">MYR {data.expenses.toFixed(2)}</h4>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
            <p className="text-sm font-bold text-emerald-500 mb-1">Net Profit</p>
            <h4 className="text-2xl font-extrabold text-emerald-900">MYR {data.profit.toFixed(2)}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">Transaction History ({data.rows} records)</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Amount (MYR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-4">02/10/2026</td>
                <td className="px-6 py-4 font-medium">Sales - H01C-1835193</td>
                <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">INCOME</span></td>
                <td className="px-6 py-4 text-right text-emerald-600 font-bold">+ 4,299.00</td>
              </tr>
              <tr>
                <td className="px-6 py-4">01/10/2026</td>
                <td className="px-6 py-4 font-medium">Restock Accessories</td>
                <td className="px-6 py-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">EXPENSE</span></td>
                <td className="px-6 py-4 text-right text-red-600 font-bold">- 3,200.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= AUTH COMPONENTS =================
function AuthScreen({ authMode, setAuthMode, onLogin }) {
  // Tambahkan state form untuk menampung ketikan user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Tembak API Neon kita
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: authMode, email, password, fullName, phone })
      });
      
      const data = await res.json();
      
      if (data.success) {
        onLogin(); // Masuk ke dashboard
      } else {
        alert(data.message); // Tampilkan error
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem/jaringan.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10">
             <Smartphone className="text-indigo-600" size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-white relative z-10">YUNG SIANG ENTERPRISE</h2>
          <p className="text-indigo-200 text-sm mt-1 font-medium relative z-10">POS & Management System</p>
        </div>
        
        <div className="p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">
            {authMode === 'login' ? 'Sign In to Your Account' : 'Register New Account'}
          </h3>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name (As per IC)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Ahmad Zulkarnain" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+60 12-345 6789" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yungsiang.my" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-md hover:shadow-lg mt-6 flex justify-center items-center gap-2 disabled:opacity-50">
              {loading ? 'Processing...' : (authMode === 'login' ? 'Secure Login' : 'Create Account')}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            {authMode === 'login' ? (
              <p>Don't have an account? <button onClick={() => setAuthMode('register')} type="button" className="text-indigo-600 font-bold hover:underline ml-1">Register here</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setAuthMode('login')} type="button" className="text-indigo-600 font-bold hover:underline ml-1">Sign In</button></p>
            )}
          </div>
        </div>
      </div>
      <p className="mt-6 text-xs text-slate-400">&copy; 2026 Yung Siang Enterprise Sdn Bhd.</p>
    </div>
  );
}