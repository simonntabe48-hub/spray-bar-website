import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Phone, Mail, MapPin, Menu, X, ArrowRight, CheckCircle, Search, Car, Wrench, 
  ShoppingCart, Shield, Clock, Award, Facebook, Instagram, Linkedin, ChevronDown, 
  Hammer, Zap, PaintBucket, Cog, Loader2, Star, CalendarDays, LayoutDashboard, 
  Calculator, Plus, AlertTriangle, Users, Trash2, Edit, Settings, Target, Lock, 
  Database, FileText, Download, Activity, DollarSign, CreditCard, Building, 
  History, Scale, Sparkles, RefreshCw, UserPlus, Upload, ImageIcon, Camera, 
  Briefcase, HardHat, TrendingUp, TrendingDown, Percent, Package, List, Layers, 
  Tag, Banknote, Wallet, Receipt, Info, Landmark, FileOutput, BarChart3, 
  UserCheck, Printer, Share2, Smartphone, Send, PieChart, BookOpen, Calendar, 
  Wifi, WifiOff, LogOut, KeyRound, ShieldAlert, ShieldCheck, RefreshCcw, Server, 
  FileSignature, Eye, Copy, Image as ImageIcon2, ArrowDownCircle, Globe, LogIn, 
  MoreHorizontal, Check, EyeOff, File, MessageCircle, Cpu, UserCog, CheckSquare, ClipboardList, Tag as TagIcon,
  Wand2, Type, Truck, MenuIcon, Bot, MessageSquare, Unlock
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, setLogLevel, deleteDoc, setDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

// --- GLOBAL CONFIGURATION & ASSETS ---
setLogLevel('error');

const IMAGES = {
  HERO_SPRAY: "IMG_1957.jpg", 
  MECHANIC: "p3-img2.jpg",
  ASSESSOR: "OIP.webp", 
  POLISHING: "4f45a516c71f7243798ee58a2b0bfc92.jpg",
  LOGO: "LOGO IDENTITY.jpeg",
  RETAIL_BG: "https://images.unsplash.com/photo-1597404294360-feeeda0d632f?auto=format&fit=crop&q=80&w=1000"
};

const COMPANY = {
  name: "Spray Bar_WS",
  tagline: "Driving Wealth Creating Opportunities",
  reg: "A2023/8326",
  address: "Lekhaloaneng, Along-Side A1 Highway, Maseru 100, Lesotho",
  phones: ["+266 5899 6795", "+266 6333 8188"],
  whatsapp: "26658996795",
  email: "spraybarpanelbeaters@gmail.com",
  socials: {
    facebook: "https://facebook.com/spraybar", 
    linkedin: "https://linkedin.com/company/spray-bar-holdings", 
    googleBusiness: "https://business.google.com", 
    maps: "https://maps.google.com/?q=Lekhaloaneng,+Along-Side+A1+Highway,+Maseru+100,+Lesotho"
  }
};

const JOB_STAGES = [
    'Assessment', 'Authorization', 'Diagnostics & AC', 'Mechanical Repair', 
    'Chassis Alignment', 'Suspension & Tyres', 'Panel Beating', 'Preparation', 
    'Spray Painting', 'Auto Electrical', 'Auto Glass', 'Polishing', 
    'Assembly', 'QC Check', 'Ready', 'Closed'
];
const TECH_TEAM = ['Unassigned', 'Simon Ntabe', 'Tebogo', 'Kabelo', 'Thabo', 'Master Tech'];
const PARTS_STATUS = ['Pending Assessment', 'Awaiting Authorization', 'Parts Ordered', 'Parts Received', 'No Parts Required'];
const PRODUCT_CATEGORIES = ['Body Parts', 'Paints & Refinishing', 'Engine Parts', 'Tyres & Wheels', 'Suspension Parts', 'Electrical Components', 'Detailing', 'Interior', 'Accessories', 'Protection'];

const DEFAULT_CONTENT = {
    heroTitle: "AI-Driven Green-Tech Auto Ecosystem",
    heroSubtitle: "Lesotho’s first AI-Driven, Green-Tech Automotive Ecosystem. Precision collision repairs, advanced alignment, and our proprietary Nexus Auto-Tech Pro SaaS platform."
};

const DEFAULT_COMPANY_DETAILS = {
    name: "SPRAY BAR_WS",
    address: "Maseru Industrial Area, Lesotho",
    phone: "+266 5899 6795",
    email: "spraybarpanelbeaters@gmail.com",
    logoUrl: IMAGES.LOGO,
};

const DEFAULT_PAYMENTS = {
    mpesaNumber: "+266 5899 6795",
    mpesaName: "Spray Bar WS",
    ecocashNumber: "+266 6333 8188",
    ecocashName: "Spray Bar WS",
    bankName: "Standard Lesotho Bank",
    bankAcc: "9080000000000",
    bankBranch: "060667",
    cardNotes: "Secure payment links are provided on your digital invoices. You may also pay directly via POS machine at our Maseru workshop.",
    footerName: "Spray Bar_WS"
};

const DEFAULT_ASSETS = {
    companyProfile: false,
    serviceCatalog: false,
    heroImage: IMAGES.HERO_SPRAY,
    serviceImages: {
        panel: IMAGES.ASSESSOR,
        paint: IMAGES.HERO_SPRAY,
        mech: IMAGES.MECHANIC,
        elec: IMAGES.POLISHING,
        polish: IMAGES.POLISHING,
        chassis: IMAGES.MECHANIC
    }
};

// --- TYPES ---
interface Job { id: string; jobCardId: string; customer: string; vehicle: string; serviceType?: string; status: string; totalRevenue: number; dateIn: string; techAssigned?: string; partsStatus?: string; notes?: string; aiEstimate?: string; [key: string]: any; }
interface Lead { id: string; name: string; phone: string; vehicle: string; service: string; notes: string; status: string; createdAt: string; source: string; requestType?: string; date?: string; time?: string; }
interface Product { id: string; name: string; category: string; price: number; stock: number; image?: string; }

// --- HELPERS ---
const formatCurrency = (amount: number) => {
    // If amount is undefined, null, or not a number, default to 0
    const safeAmount = Number(amount) || 0;
    return `R ${safeAmount.toLocaleString()}`;
};

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                // Support 4K high-resolution displays
                const MAX_WIDTH = 3840;
                const MAX_HEIGHT = 3840;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                let quality = 0.95;
                let dataUrl = canvas.toDataURL('image/webp', quality);
                
                // Stay under Firestore's 1MB doc limit (safe limit ~950k base64 chars per document)
                while (dataUrl.length > 950000 && quality > 0.4) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL('image/webp', quality);
                }

                // If still too large, aggressively scale dimensions to guarantee it saves
                if (dataUrl.length > 950000) {
                    let scale = 0.8;
                    while (dataUrl.length > 950000 && scale > 0.3) {
                        canvas.width = width * scale;
                        canvas.height = height * scale;
                        ctx?.clearRect(0, 0, canvas.width, canvas.height);
                        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                        dataUrl = canvas.toDataURL('image/webp', 0.6);
                        scale -= 0.2;
                    }
                }
                
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const FirestoreImage = ({ src, fallback, className, alt, db }: { src?: string, fallback: string, className?: string, alt?: string, db: any }) => {
    const [imgSrc, setImgSrc] = useState<string>(fallback);

    useEffect(() => {
        if (!src) { 
            setImgSrc(fallback); 
            return; 
        }
        if (src.startsWith('data:') || src.startsWith('http') || src.includes('.')) {
            setImgSrc(src);
            return;
        }
        if (src.startsWith('asset:')) {
            const docId = src.replace('asset:', '');
            const appId = (window as any).__app_id || 'default-app-id';
            getDoc(doc(db, `artifacts/${appId}/public/data/assets`, docId)).then(snap => {
                if (snap.exists() && snap.data().fileData) {
                    setImgSrc(snap.data().fileData);
                } else {
                    setImgSrc(fallback);
                }
            }).catch(() => setImgSrc(fallback));
        }
    }, [src, fallback, db]);

    return <img src={imgSrc} className={className} alt={alt} />;
};

// --- COMPONENTS ---

const QuoteModal = ({ db, onClose, initialMode = 'quote' }: { db: any, onClose: () => void, initialMode?: 'quote' | 'booking' }) => {
    const [mode, setMode] = useState<'quote' | 'booking'>(initialMode);
    const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '', service: 'Panel Beating', notes: '', date: '', time: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const response = await fetch('https://nexus-backend-q1ld.onrender.com/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
            const appId = (window as any).__app_id || 'default-app-id';
            await addDoc(collection(db, `artifacts/${appId}/public/data/leads`), {
                ...formData,
                requestType: mode,
                status: 'New Lead',
                source: 'Website Front-Door',
                createdAt: new Date().toISOString()
            });
            setSuccess(true);
            setTimeout(() => onClose(), 2500);
        } catch (err) {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                <div className="bg-slate-900 p-6 flex flex-col relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-xl uppercase tracking-tight text-white">Client Portal</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="flex bg-slate-800 rounded-xl p-1">
                        <button type="button" onClick={() => setMode('quote')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${mode === 'quote' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Online Quote</button>
                        <button type="button" onClick={() => setMode('booking')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${mode === 'booking' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>Book Assessment</button>
                    </div>
                </div>
                {success ? (
                    <div className="p-10 text-center">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h4 className="text-2xl font-black uppercase text-slate-800">Success!</h4>
                        <p className="text-slate-500 font-medium">Sent to Nexus Backend.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required placeholder="Name" className="bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            <input required placeholder="Phone" className="bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <input required placeholder="Vehicle (e.g. Ford Ranger 2022)" className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} />
                        {mode === 'booking' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input required type="date" className="bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                <input required type="time" className="bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                            </div>
                        )}
                        <select className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
                            <option>Panel Beating</option>
                            <option>Spray Painting</option>
                            <option>Mechanical Repairs</option>
                            <option>Auto Electrical</option>
                            <option>Diagnostics & AC</option>
                            <option>Tyres & Alignment</option>
                            <option>Suspension & Steering</option>
                            <option>Auto Glass</option>
                            <option>Polishing & Detailing</option>
                        </select>
                        <textarea placeholder="Tell us about the damage or parts needed..." className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold h-24" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                        <button type="submit" disabled={submitting} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:bg-blue-600">
                            {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Submission'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const CheckoutModal = ({ db, item, onClose, showToast }: { db: any, item: any, onClose: () => void, showToast: any }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '', method: 'M-Pesa' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const appId = (window as any).__app_id || 'default-app-id';
            await addDoc(collection(db, `artifacts/${appId}/public/data/leads`), {
                name: formData.name,
                phone: formData.phone,
                vehicle: 'Retail Order',
                service: `Order: ${item.name} (${formatCurrency(item.price)})`,
                notes: `Delivery: ${formData.address} | Payment Method: ${formData.method}`,
                requestType: 'order',
                status: 'New Lead',
                source: 'Online Store',
                createdAt: new Date().toISOString()
            });
            setSuccess(true);
            setTimeout(() => onClose(), 3000);
        } catch (err) {
            setSubmitting(false);
            showToast("Failed to process order. Please try again.", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                <div className="bg-slate-900 p-6 flex flex-col relative">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-black text-xl uppercase tracking-tight text-white flex items-center gap-2"><Lock size={20} className="text-green-500"/> Secure Checkout</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Complete your order</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-700">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Item</p>
                            <p className="text-sm text-white font-black">{item.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
                            <p className="text-lg text-green-400 font-black">{formatCurrency(item.price)}</p>
                        </div>
                    </div>
                </div>
                {success ? (
                    <div className="p-10 text-center">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h4 className="text-2xl font-black uppercase text-slate-800">Order Placed!</h4>
                        <p className="text-slate-500 font-medium mb-4">Your order has been sent to the Nexus backend.</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Payment Instructions</p>
                            {formData.method === 'M-Pesa' && <p className="text-sm font-bold text-slate-800">Please send {formatCurrency(item.price)} via M-Pesa to <br/><span className="text-blue-600 text-lg">5899 6795</span></p>}
                            {formData.method === 'EcoCash' && <p className="text-sm font-bold text-slate-800">Please send {formatCurrency(item.price)} via EcoCash to <br/><span className="text-orange-600 text-lg">6333 8188</span></p>}
                            {formData.method === 'Instant EFT' && <p className="text-sm font-bold text-slate-800">Bank details have been sent to your phone number via SMS.</p>}
                            {formData.method === 'Card (PayFast)' && <p className="text-sm font-bold text-slate-800">A secure payment link has been sent to your phone.</p>}
                            {formData.method === 'Pay on Collection' && <p className="text-sm font-bold text-slate-800">Please pay via Card or Cash when collecting at the Maseru branch.</p>}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2">1. Your Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input required placeholder="Full Name" className="bg-slate-50 border p-3 rounded-xl text-sm font-bold focus:border-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                <input required placeholder="Phone Number" className="bg-slate-50 border p-3 rounded-xl text-sm font-bold focus:border-blue-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <input placeholder="Delivery Address (Optional)" className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold focus:border-blue-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2 mt-2">2. Payment Method</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'M-Pesa', icon: Smartphone, color: 'text-red-500' },
                                    { id: 'EcoCash', icon: Smartphone, color: 'text-blue-500' },
                                    { id: 'Card (PayFast)', icon: CreditCard, color: 'text-slate-800' },
                                    { id: 'Instant EFT', icon: Landmark, color: 'text-green-600' },
                                    { id: 'Pay on Collection', icon: Banknote, color: 'text-orange-500' }
                                ].map(m => (
                                    <button 
                                        type="button" 
                                        key={m.id}
                                        onClick={() => setFormData({...formData, method: m.id})}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.method === m.id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                                    >
                                        <m.icon size={20} className={m.color} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 text-center">{m.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:bg-blue-600 mt-6 shadow-xl">
                            {submitting ? <Loader2 className="animate-spin" /> : <>Confirm Order <ArrowRight size={16}/></>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const PaymentModal = ({ onClose, config }: { onClose: () => void, config: any }) => {
    const p = config?.payments || DEFAULT_PAYMENTS;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="bg-slate-900 p-6 flex flex-col relative">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-black text-xl uppercase tracking-tight text-white flex items-center gap-2"><ShieldCheck size={20} className="text-green-500"/> Secure Payments</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full"><X size={20} /></button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Official Spray Bar Accounts</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-red-300 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2"><Smartphone size={16} className="text-red-500"/> M-Pesa</span>
                        </div>
                        <p className="text-xl font-black text-slate-900">{p.mpesaNumber}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Registered Name: {p.mpesaName}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2"><Smartphone size={16} className="text-blue-500"/> EcoCash</span>
                        </div>
                        <p className="text-xl font-black text-slate-900">{p.ecocashNumber}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Registered Name: {p.ecocashName}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-green-300 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2"><Landmark size={16} className="text-green-600"/> Bank Transfer / EFT</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{p.bankName}</p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase mt-1">Acc: {p.bankAcc} | Branch: {p.bankBranch}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2"><CreditCard size={16} className="text-slate-800"/> Visa & Mastercard</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase leading-relaxed">{p.cardNotes}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DriveMasterRetail = ({ db, config, showToast, onCheckout, liveInventory }: { db: any, config: any, showToast: any, onCheckout: (item: any) => void, liveInventory: Product[] }) => {
    const [loadingCatalog, setLoadingCatalog] = useState(false);

    // Fallback products if the WMS inventory is empty
    const fallbackProducts = [
        { id: 'fb1', name: "OEM Brake Pads Set", price: 850, category: "Engine Parts", icon: Cog },
        { id: 'fb2', name: "2K Clear Coat Spray", price: 320, category: "Paints & Refinishing", icon: PaintBucket },
        { id: 'fb3', name: "LED Headlight Bulbs", price: 450, category: "Electrical Components", icon: Zap },
        { id: 'fb4', name: "SB Premium Wax", price: 250, category: "Detailing", icon: Sparkles }
    ];

    const displayProducts = liveInventory && liveInventory.length > 0 
        ? liveInventory.slice(0, 4).map(p => ({ ...p, icon: Package })) 
        : fallbackProducts;

    const handleExploreShop = async () => {
        if (!config?.assets?.serviceCatalog) {
            showToast("The full retail catalog is currently updating. Please check back soon!", "info");
            return;
        }
        setLoadingCatalog(true);
        try {
            const appId = (window as any).__app_id || 'default-app-id';
            const docRef = doc(db, `artifacts/${appId}/public/data/assets`, 'serviceCatalog');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const dataUrl = docSnap.data().fileData;
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = "Drive_Master_Catalog.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                showToast("Catalog file not found on server.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to load the catalog.", "error");
        } finally {
            setLoadingCatalog(false);
        }
    };

    return (
        <section id="retail" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                    <div>
                        <span className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-2 block">Drive Master Retail</span>
                        <h2 className="text-4xl font-black uppercase text-slate-900">Auto Parts & Aftercare</h2>
                    </div>
                    <button 
                        onClick={handleExploreShop}
                        disabled={loadingCatalog}
                        className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest hover:translate-x-2 transition-transform disabled:opacity-50"
                    >
                        {loadingCatalog ? <Loader2 size={16} className="animate-spin" /> : <>Explore Full Shop <ArrowRight size={16} /></>}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.map((p: any, i: number) => (
                        <div key={i} className="group bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all flex flex-col relative overflow-hidden">
                            {liveInventory.length > 0 && <span className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Live Stock</span>}
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <p.icon size={28} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">{p.category}</span>
                            <h3 className="font-black text-slate-900 text-lg mb-4">{p.name}</h3>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="font-black text-xl text-blue-600">{formatCurrency(p.price)}</span>
                                <button onClick={() => onCheckout(p)} className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-green-500 transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2">Buy <ShoppingCart size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PartsNavigator = ({ showToast, onCheckout, liveInventory }: { showToast: any, onCheckout: (item: any) => void, liveInventory: Product[] }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    
    // AI Search State
    const [aiQuery, setAiQuery] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

    const categories = ['All', 'Engine & Brakes', 'Body Parts', 'Electrical Components', 'Suspension Parts', 'Tyres & Wheels', 'Detailing', 'Accessories'];

    const fallbackParts = [
        { id: "1", name: "Brembo Carbon Ceramic Brake Kit", brand: "Brembo", category: "Engine & Brakes", price: 3450, rating: 4.9, reviews: 128, type: "Aftermarket", stock: "In Stock", delivery: "Ships in 24h" },
        { id: "2", name: "Hilux Revo Front Bumper (2021+)", brand: "OEM Toyota", category: "Body Parts", price: 4200, rating: 4.8, reviews: 56, type: "OEM", stock: "Low Stock", delivery: "Ships in 3-5 days" },
        { id: "3", name: "Bosch High-Output Alternator", brand: "Bosch", category: "Electrical Components", price: 2100, rating: 4.7, reviews: 89, type: "Aftermarket", stock: "In Stock", delivery: "Ships in 24h" },
        { id: "4", name: "Bilstein B6 Shock Absorbers", brand: "Bilstein", category: "Suspension Parts", price: 8900, rating: 5.0, reviews: 210, type: "Aftermarket", stock: "In Stock", delivery: "Ships in 24h" },
        { id: "5", name: "NGK Iridium Spark Plugs (Set of 4)", brand: "NGK", category: "Engine & Brakes", price: 450, rating: 4.8, reviews: 342, type: "Aftermarket", stock: "In Stock", delivery: "Ships in 24h" },
        { id: "6", name: "Ford Ranger Wildtrak Headlight Assembly", brand: "OEM Ford", category: "Electrical Components", price: 6500, rating: 4.6, reviews: 24, type: "OEM", stock: "Out of Stock", delivery: "Pre-order" },
        { id: "7", name: "BFGoodrich All-Terrain T/A KO2", brand: "BFGoodrich", category: "Tyres & Wheels", price: 3800, rating: 4.9, reviews: 512, type: "Aftermarket", stock: "In Stock", delivery: "Ships in 48h" },
        { id: "8", name: "VW Amarok Tailgate Handle", brand: "OEM VW", category: "Body Parts", price: 850, rating: 4.5, reviews: 18, type: "OEM", stock: "In Stock", delivery: "Ships in 24h" },
    ];

    // Combine hardcoded fallbacks with live backend inventory
    const allParts = useMemo(() => {
        const liveMapped = liveInventory.map(p => ({
            id: p.id, name: p.name, brand: "Spray Bar Verified", category: p.category, 
            price: p.price, rating: 5.0, reviews: 1, type: "Retail", 
            stock: p.stock > 0 ? 'In Stock' : 'Out of Stock', delivery: "Ships in 24h"
        }));
        return [...liveMapped, ...fallbackParts];
    }, [liveInventory]);

    const handleAiMatch = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        setSearch(''); // Clear standard search
        setCategory('All');
        
        try {
            const apiKey = "";
            const catalogStr = allParts.map(p => `{id: "${p.id}", name: "${p.name}", category: "${p.category}"}`).join(', ');
            const prompt = `You are an AI Auto Parts Shopping Assistant for Spray Bar. Customer request: "${aiQuery}".
Available Catalog: [${catalogStr}]
Based on their symptoms or request, select up to 4 most relevant products from the catalog to fix their issue. 
Return ONLY a valid JSON array of their exact string IDs. Example format: ["1", "3", "abc123xyz"]. Do not include markdown or explanations.`;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";
            const cleanText = text.replace(/[\`]{3}json/gi, '').replace(/[\`]{3}/g, '').trim();
            
            let recommendedIds = [];
            try {
                recommendedIds = JSON.parse(cleanText);
            } catch(e) {
                console.error("AI JSON Parse Error:", e);
                throw new Error("Invalid format returned by AI.");
            }

            if (Array.isArray(recommendedIds) && recommendedIds.length > 0) {
                setAiRecommendations(recommendedIds);
                showToast("AI found the perfect matches for your vehicle!", "success");
            } else {
                setAiRecommendations([]);
                showToast("AI couldn't find an exact match. Please browse our catalog below.", "info");
            }
        } catch (e) {
            console.error("AI Error:", e);
            showToast("AI Assistant is currently analyzing high traffic. Try standard search.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const filteredParts = allParts.filter(p => {
        // If AI recommendations exist, show only those
        if (aiRecommendations.length > 0) return aiRecommendations.includes(p.id);
        
        // Safe fallbacks in case database items are missing names or brands
        const safeName = p.name || '';
        const safeBrand = p.brand || '';
        const safeSearch = search || '';

        // Otherwise use standard search & category
        return (category === 'All' || p.category === category) &&
               (safeName.toLowerCase().includes(safeSearch.toLowerCase()) || 
                safeBrand.toLowerCase().includes(safeSearch.toLowerCase()));
    });

    return (
        <section id="parts" className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-2 block">Global Supply Chain</span>
                    <h2 className="text-4xl font-black uppercase text-slate-900 mb-4">Smart Parts Navigator</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium">Source high-quality components directly from our global network. Millions of parts, competitive pricing, shipped fast.</p>
                </div>

                {/* AI Shopping Assistant Bar */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-1 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="bg-slate-900 p-6 rounded-xl relative z-10 flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-shrink-0 bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/50">
                            <Bot size={32} className="text-white" />
                        </div>
                        <div className="flex-1 w-full">
                            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1 flex items-center gap-2">Nexus AI Shopping Assistant</h3>
                            <div className="relative flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Describe your issue or what you need... (e.g. 'My brakes are squeaking on my Ford Ranger')" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-4 py-3.5 font-bold text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiMatch()}
                                />
                                <button 
                                    onClick={handleAiMatch}
                                    disabled={aiLoading || !aiQuery.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-900/20"
                                >
                                    {aiLoading ? <Loader2 className="animate-spin" size={16} /> : <><Wand2 size={16} /> Auto-Match</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Standard Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 mb-10 flex flex-col lg:flex-row gap-4 z-10 relative">
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="Standard search by Part Name, Brand, or Model..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-bold text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setAiRecommendations([]); }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar items-center">
                        {categories.map(c => (
                            <button 
                                key={c}
                                onClick={() => { setCategory(c); setAiRecommendations([]); }}
                                className={`whitespace-nowrap px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${category === c && aiRecommendations.length === 0 ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Results Header */}
                {aiRecommendations.length > 0 && (
                    <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-bottom-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/50"></div>
                        <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border border-blue-200">
                            <Sparkles size={14} className="text-blue-600" /> AI Recommended Matches
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/50"></div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredParts.map((p, i) => (
                        <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all group flex flex-col h-full relative overflow-hidden animate-in zoom-in-95" style={{animationDelay: `${i * 50}ms`}}>
                            {aiRecommendations.includes(p.id) && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-xl shadow-lg z-20 flex items-center gap-1">
                                    <Bot size={10} /> AI Pick
                                </div>
                            )}
                            <div className={`h-40 rounded-2xl mb-5 flex items-center justify-center p-4 relative transition-colors ${aiRecommendations.includes(p.id) ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                                <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md z-10 ${p.type === 'OEM' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>{p.type}</span>
                                <Package size={48} className={`transition-colors drop-shadow-sm group-hover:scale-110 duration-500 ${aiRecommendations.includes(p.id) ? 'text-blue-400 group-hover:text-blue-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                                <Star className="text-yellow-400 fill-yellow-400" size={12} />
                                <span className="text-xs font-bold text-slate-700">{p.rating.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-400 font-bold">({p.reviews})</span>
                            </div>
                            <h3 className="font-black text-slate-900 text-sm mb-1 leading-snug line-clamp-2">{p.name}</h3>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-5">{p.brand}</p>
                            
                            <div className="mt-auto">
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <span className="block text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">{p.delivery}</span>
                                        <span className="font-black text-2xl text-slate-900 tracking-tight">{formatCurrency(p.price)}</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${p.stock === 'In Stock' ? 'bg-green-100 text-green-700' : p.stock === 'Low Stock' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span>
                                </div>
                                <button onClick={() => onCheckout(p)} className={`w-full text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2 shadow-lg ${aiRecommendations.includes(p.id) ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30' : 'bg-slate-900 hover:bg-slate-800'}`}>
                                    <ShoppingCart size={14} /> Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredParts.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <Bot size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-black text-slate-800 uppercase mb-2">No parts found</h3>
                            <p className="text-slate-500 font-medium mb-4">Try adjusting your search terms or ask the AI Assistant.</p>
                            <button onClick={() => { setAiRecommendations([]); setSearch(''); setCategory('All'); }} className="text-blue-600 font-bold uppercase text-xs tracking-widest hover:underline">Reset Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const WebsiteView = ({ db, onLogin, config }: { db: any, onLogin: () => void, config: any }) => {
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteMode, setQuoteMode] = useState<'quote' | 'booking'>('quote');
    const [checkoutItem, setCheckoutItem] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [trackId, setTrackId] = useState('');
    const [trackStatus, setTrackStatus] = useState<any>(null);
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackError, setTrackError] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);
    const [liveInventory, setLiveInventory] = useState<Product[]>([]);

    useEffect(() => {
        if (!db) return;
        const appId = (window as any).__app_id || 'default-app-id';
        const unsub = onSnapshot(collection(db, `artifacts/${appId}/public/data/inventory`), (snap) => {
            setLiveInventory(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        });
        return () => unsub();
    }, [db]);

    const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleTrack = async () => {
        if (!trackId.trim()) return;
        setTrackLoading(true);
        setTrackError('');
        setTrackStatus(null);
        try {
            const appId = (window as any).__app_id || 'default-app-id';
            const q = query(collection(db, `artifacts/${appId}/public/data/jobs`), where("jobCardId", "==", trackId.trim().toUpperCase()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setTrackStatus(querySnapshot.docs[0].data());
            } else {
                setTrackError('Job Card not found.');
            }
        } catch (err) {
            setTrackError('Error fetching status.');
        } finally {
            setTrackLoading(false);
        }
    };

    return (
        <div className="font-sans antialiased text-slate-900 bg-white">
            <div className="fixed w-full z-50 flex flex-col">
                {toast && (
                    <div className={`absolute top-20 right-4 z-[200] px-6 py-3 rounded-xl shadow-2xl font-bold text-sm uppercase tracking-widest animate-in slide-in-from-top-2 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'}`}>
                        {toast.type === 'error' && <AlertTriangle size={18} />}
                        {toast.type === 'success' && <CheckCircle size={18} />}
                        {toast.type === 'info' && <Info size={18} />}
                        {toast.message}
                    </div>
                )}
                <div className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-widest py-2 px-4 hidden lg:block border-b border-slate-800">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex gap-6">
                            <a href={COMPANY.socials.maps} target="_blank" rel="noreferrer" className="hover:text-red-400 flex items-center gap-1 transition-colors"><MapPin size={10}/> {COMPANY.address}</a>
                            <a href={`tel:${COMPANY.phones[0]}`} className="hover:text-blue-400 flex items-center gap-1 transition-colors"><Phone size={10}/> {COMPANY.phones[0]}</a>
                        </div>
                        <div className="flex gap-4">
                            <a href={COMPANY.socials.facebook} target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors" title="Facebook"><Facebook size={12}/></a>
                            <a href={COMPANY.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors" title="LinkedIn"><Linkedin size={12}/></a>
                            <a href={COMPANY.socials.googleBusiness} target="_blank" rel="noreferrer" className="hover:text-orange-400 transition-colors" title="Google Business"><Star size={12}/></a>
                            <a href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hello Spray Bar Team!")}`} target="_blank" rel="noreferrer" className="hover:text-green-500 transition-colors" title="WhatsApp Support"><MessageCircle size={12}/></a>
                        </div>
                    </div>
                </div>
                <nav className="w-full bg-white/90 backdrop-blur-md shadow-sm py-4">
                    <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                        <div className="flex items-center gap-3 font-black text-xl tracking-tighter leading-none">
                            SPRAY BAR<span className="text-red-500">_WS</span>
                        </div>
                        <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
                            <a href="#home" className="hover:text-red-600 transition-colors">Home</a>
                            <a href="#about" className="hover:text-red-600 transition-colors">About</a>
                            <a href="#services" className="hover:text-red-600 transition-colors">Services</a>
                            <a href="#retail" className="hover:text-red-600 transition-colors">Retail</a>
                            <a href="#parts" className="hover:text-blue-600 transition-colors text-blue-500 flex items-center gap-1"><Package size={14}/> Parts</a>
                            <button onClick={() => { setQuoteMode('quote'); setIsQuoteModalOpen(true); }} className="bg-red-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-105">Get Quote</button>
                            <button onClick={onLogin} className="text-slate-400 hover:text-blue-600 transition-colors" title="Staff Login"><Lock size={18} /></button>
                        </div>
                        <button className="lg:hidden text-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                    {isMobileMenuOpen && (
                        <div className="lg:hidden bg-white border-t border-slate-100 p-4 flex flex-col gap-4 text-sm font-bold uppercase tracking-widest">
                            <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-600">Home</a>
                            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-600">About</a>
                            <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-600">Services</a>
                            <a href="#retail" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-600">Retail</a>
                            <a href="#parts" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600">Parts Navigator</a>
                            <button onClick={() => { setIsMobileMenuOpen(false); setQuoteMode('quote'); setIsQuoteModalOpen(true); }} className="bg-red-600 text-white py-3 rounded-xl text-center">Get Quote</button>
                            <button onClick={() => { setIsMobileMenuOpen(false); onLogin(); }} className="bg-slate-900 text-white py-3 rounded-xl text-center">Staff Login</button>
                        </div>
                    )}
                </nav>
            </div>

            {/* HERO SECTION */}
            <section id="home" className="relative min-h-screen flex items-center pt-32">
                <div className="absolute inset-0 z-0">
                    <FirestoreImage src={config.assets?.heroImage} fallback={IMAGES.HERO_SPRAY} className="w-full h-full object-cover" db={db} />
                    <div className="absolute inset-0 bg-slate-900/80"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-white">
                        <span className="bg-red-600 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Lesotho's 1st AI-Driven Ecosystem</span>
                        <h1 className="text-5xl md:text-6xl font-black uppercase leading-[0.9] mb-8">
                            {config?.content?.heroTitle || DEFAULT_CONTENT.heroTitle}
                        </h1>
                        <p className="text-slate-300 text-lg mb-10 max-w-md">
                            {config?.content?.heroSubtitle || DEFAULT_CONTENT.heroSubtitle}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => { setQuoteMode('booking'); setIsQuoteModalOpen(true); }} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-full font-black uppercase text-sm tracking-widest flex items-center gap-2 transition-colors">Book Service <CalendarDays size={18}/></button>
                            <button onClick={() => { setQuoteMode('quote'); setIsQuoteModalOpen(true); }} className="bg-white text-slate-900 px-8 py-4 rounded-full font-black uppercase text-sm tracking-widest flex items-center gap-2 transition-colors">Request Quote <FileSignature size={18}/></button>
                            <a href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hello Spray Bar Team! I am reaching out from your website and need some assistance.")}`} target="_blank" rel="noreferrer" className="bg-slate-900/50 backdrop-blur-md border border-slate-700 text-white px-8 py-4 rounded-full font-black uppercase text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">Customer Support <MessageCircle size={18}/></a>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                        <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center gap-2"><Server size={18} className="text-blue-500" /> Nexus Tracking</h3>
                        {!trackStatus ? (
                            <>
                                <div className="flex gap-2">
                                    <input value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder="JC-XXXX" className="flex-1 bg-white p-4 rounded-xl font-bold uppercase text-slate-900" />
                                    <button onClick={handleTrack} disabled={trackLoading} className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                        {trackLoading ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                                    </button>
                                </div>
                                {trackError && <p className="text-red-400 text-[10px] mt-2 uppercase font-bold tracking-widest text-center">{trackError}</p>}
                                <p className="text-white/40 text-[10px] mt-4 uppercase font-bold tracking-widest text-center">Enter your repair reference for real-time updates</p>
                            </>
                        ) : (
                            <div className="bg-white p-6 rounded-2xl animate-in fade-in">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Vehicle</p>
                                        <h4 className="font-black text-slate-900">{trackStatus.vehicle}</h4>
                                    </div>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{trackStatus.status}</span>
                                </div>
                                <button onClick={() => {setTrackStatus(null); setTrackId('');}} className="w-full py-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-blue-600 flex items-center justify-center gap-2 border-t mt-2 pt-4">
                                    <RefreshCcw size={14} /> Track Another
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* QUICK ACTIONS SECTION */}
            <section className="bg-slate-950 py-12 relative z-20 border-t border-slate-800 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <button onClick={() => { setQuoteMode('booking'); setIsQuoteModalOpen(true); }} className="text-left bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-orange-500 group transition-all">
                            <CalendarDays className="text-orange-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                            <h4 className="font-black text-white uppercase text-sm mb-2">Book Service</h4>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Schedule repairs, diagnostics, refinishing, or maintenance with the Spray Bar team.</p>
                        </button>
                        <button onClick={() => { setQuoteMode('quote'); setIsQuoteModalOpen(true); }} className="text-left bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500 group transition-all">
                            <FileSignature className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                            <h4 className="font-black text-white uppercase text-sm mb-2">Request Quote</h4>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Request a clear quotation for repair, paint, fleet, or workshop service work.</p>
                        </button>
                        <a href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hello Spray Bar Team! I am on your website and would like to contact support regarding a service.")}`} target="_blank" rel="noreferrer" className="block text-left bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-green-500 group transition-all">
                            <MessageCircle className="text-green-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                            <h4 className="font-black text-white uppercase text-sm mb-2">Contact Support</h4>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Reach Spray Bar via WhatsApp for customer assistance, booking help, and service enquiries.</p>
                        </a>
                        <a href={COMPANY.socials.maps} target="_blank" rel="noreferrer" className="block text-left bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-red-500 group transition-all">
                            <MapPin className="text-red-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                            <h4 className="font-black text-white uppercase text-sm mb-2">Find Workshop</h4>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Navigate directly to our Maseru facility using Google Maps for your scheduled repairs.</p>
                        </a>
                    </div>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section id="about" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-2 block">Who We Are</span>
                        <h2 className="text-4xl font-black uppercase text-slate-900 mb-6">Lesotho’s 1st AI-Driven, Green-Tech Automotive Ecosystem</h2>
                        
                        <div className="space-y-6 mb-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-blue-600">
                                <h3 className="font-black text-slate-900 uppercase text-sm mb-2">Vision</h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">To be the undisputed leader in Lesotho’s automotive industry through technological innovation, delivering global standards locally.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-red-600">
                                <h3 className="font-black text-slate-900 uppercase text-sm mb-2">Mission</h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">To professionalize the industry by establishing a fully integrated business system, prioritizing Import Substitution, and creating wealth-generating technical jobs for Basotho.</p>
                            </div>
                        </div>

                        <h3 className="text-xl font-black uppercase text-slate-900 mb-6 border-b pb-2">Products & Services Portfolio</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Our portfolio is a tightly integrated mix of physical services and digital products:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-green-500 transition-colors">
                                <PaintBucket className="text-green-600 mb-4 group-hover:scale-110 transition-transform" size={28} />
                                <h4 className="font-black text-slate-900 uppercase text-sm mb-2">Green-Tech Collision Repair</h4>
                                <p className="text-xs text-slate-600 font-medium">Waterborne spray painting and structural panel beating.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-red-500 transition-colors">
                                <Truck className="text-red-600 mb-4 group-hover:scale-110 transition-transform" size={28} />
                                <h4 className="font-black text-slate-900 uppercase text-sm mb-2">24/7 Rapid Recovery</h4>
                                <p className="text-xs text-slate-600 font-medium">Rollback towing directly from accident scenes.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-orange-500 transition-colors">
                                <Settings className="text-orange-600 mb-4 group-hover:scale-110 transition-transform" size={28} />
                                <h4 className="font-black text-slate-900 uppercase text-sm mb-2">Advanced Alignment & Fitment</h4>
                                <p className="text-xs text-slate-600 font-medium">Heavy-duty Hunter HawkEye suspension alignment, A/T tyre fitment, and electronic diagnostics.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-purple-500 transition-colors">
                                <Cpu className="text-purple-600 mb-4 group-hover:scale-110 transition-transform" size={28} />
                                <h4 className="font-black text-slate-900 uppercase text-sm mb-2">Nexus Auto-Tech Pro (SaaS)</h4>
                                <p className="text-xs text-slate-600 font-medium">Proprietary “Shop-in-a-Box” WMS offering AI-damage estimating, live API parts ordering, and digital job-card tracking.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full min-h-[600px] lg:h-[800px]">
                        <FirestoreImage src={config.assets?.serviceImages?.panel} fallback={IMAGES.ASSESSOR} className="absolute inset-0 w-full h-full object-cover" alt="About Us" db={db} />
                    </div>
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section id="services" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-2 block">Our Expertise</span>
                        <h2 className="text-4xl font-black uppercase text-slate-900">Professional Services</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: PaintBucket, title: "Spray Painting", desc: "Expert computerized color matching.", img: config.assets?.serviceImages?.paint, fallback: IMAGES.HERO_SPRAY },
                            { icon: Hammer, title: "Panel Beating", desc: "Advanced structural repairs.", img: config.assets?.serviceImages?.panel, fallback: IMAGES.ASSESSOR },
                            { icon: Cog, title: "Mechanical Repairs", desc: "Comprehensive engine diagnostics.", img: config.assets?.serviceImages?.mech, fallback: IMAGES.MECHANIC },
                            { icon: Zap, title: "Auto Electrical", desc: "Professional electrical analysis.", img: config.assets?.serviceImages?.elec, fallback: IMAGES.POLISHING },
                            { icon: Truck, title: "Towing & Recovery", desc: "24/7 Rollback towing from accident scenes.", img: config.assets?.serviceImages?.towing, fallback: IMAGES.MECHANIC },
                            { icon: Settings, title: "Suspension", desc: "Shocks, struts, and steering repairs.", img: config.assets?.serviceImages?.suspension, fallback: IMAGES.MECHANIC },
                            { icon: Wrench, title: "Chassis Straightening", desc: "Specialized 3D frame alignment.", img: config.assets?.serviceImages?.chassis, fallback: IMAGES.MECHANIC },
                            { icon: Car, title: "Tyres & Alignment", desc: "Wheel balancing, alignment, and new tyres.", img: config.assets?.serviceImages?.tyres, fallback: IMAGES.MECHANIC },
                            { icon: Sparkles, title: "Polishing & Detailing", desc: "Showroom-quality finishing.", img: config.assets?.serviceImages?.polish, fallback: IMAGES.POLISHING }
                        ].map((s, idx) => (
                            <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
                                <div className="h-48 overflow-hidden relative">
                                    <FirestoreImage src={s.img} fallback={s.fallback} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.title} db={db} />
                                </div>
                                <div className="p-8 relative">
                                    <div className="absolute -top-6 right-6 w-12 h-12 bg-blue-600 rounded-xl text-white flex items-center justify-center shadow-lg group-hover:-translate-y-2 transition-transform">
                                        <s.icon size={24} />
                                    </div>
                                    <h3 className="font-black text-lg uppercase text-slate-900 mb-2">{s.title}</h3>
                                    <p className="text-slate-500 text-sm">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <DriveMasterRetail db={db} config={config} showToast={showToast} onCheckout={setCheckoutItem} liveInventory={liveInventory} />
            <PartsNavigator showToast={showToast} onCheckout={setCheckoutItem} liveInventory={liveInventory} />

            {/* TESTIMONIALS */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <span className="text-red-500 font-black text-xs uppercase tracking-widest">Verified Reviews</span>
                    <h2 className="text-4xl font-black uppercase mt-2 mb-12">Client Experiences</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Thabo M.", text: "Exceptional service! They color-matched my bumper perfectly after a fender bender. Highly professional team in Maseru.", rating: 5, date: "2 days ago" },
                            { name: "Sarah L.", text: "The online booking was so easy. I brought my car in for an assessment and the quote was transparent and fair. Great Nexus backend tracking too!", rating: 5, date: "1 week ago" },
                            { name: "Khotso N.", text: "Their chassis straightening tech is top-notch. My Hilux drives perfectly straight again. Worth every Loti.", rating: 5, date: "1 month ago" }
                        ].map((review, i) => (
                            <div key={i} className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-slate-700 text-left">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-1">
                                        {[...Array(review.rating)].map((_, j) => <Star key={j} className="text-yellow-400 fill-yellow-400" size={14} />)}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{review.date}</span>
                                </div>
                                <p className="text-slate-300 italic text-sm mb-6">"{review.text}"</p>
                                <p className="font-black uppercase text-xs text-white">{review.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
                        <a href={COMPANY.socials.maps} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-slate-300 font-bold text-sm hover:text-red-400 transition-colors">
                            <MapPin className="text-red-500" size={18}/> {COMPANY.address}
                        </a>
                        <a href={`tel:${COMPANY.phones[0]}`} className="flex items-center justify-center gap-2 text-slate-300 font-bold text-sm hover:text-blue-400 transition-colors">
                            <Phone className="text-blue-500" size={18}/> {COMPANY.phones.join(' / ')}
                        </a>
                    </div>
                    
                    <div className="flex justify-center gap-4 mb-8">
                        <a href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hello Spray Bar Team!")}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors" title="WhatsApp Support"><MessageCircle size={20}/></a>
                        <a href={COMPANY.socials.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="Facebook"><Facebook size={20}/></a>
                        <a href={COMPANY.socials.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-400 hover:text-white transition-colors" title="LinkedIn"><Linkedin size={20}/></a>
                        <a href={COMPANY.socials.googleBusiness} target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-colors" title="Google Business"><Star size={20}/></a>
                    </div>

                    <div className="flex justify-center gap-6 mb-8 text-slate-500 flex-wrap">
                        <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"><Smartphone size={14}/> M-Pesa</button>
                        <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors"><Smartphone size={14}/> EcoCash</button>
                        <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-slate-300 transition-colors"><CreditCard size={14}/> Visa & Mastercard</button>
                        <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-green-500 transition-colors"><Landmark size={14}/> Instant EFT</button>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-800/50 mt-8">
                        <div className="flex items-center gap-2 mb-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">System Status: Online</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} {config?.payments?.footerName || 'Spray Bar_WS'} | Nexus System Enabled
                        </p>
                    </div>
                </div>
            </footer>

            {isQuoteModalOpen && <QuoteModal db={db} onClose={() => setIsQuoteModalOpen(false)} initialMode={quoteMode} />}
            {checkoutItem && <CheckoutModal db={db} item={checkoutItem} onClose={() => setCheckoutItem(null)} showToast={showToast} />}
            {isPaymentModalOpen && <PaymentModal onClose={() => setIsPaymentModalOpen(false)} config={config} />}
        </div>
    );
};

// --- WMS (NEXUS PORTAL) ---

const WMSView = ({ db, user, role, onExit, config, setConfig }: { db: any, user: any, role: 'admin' | 'staff', onExit: () => void, config: any, setConfig: any }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unlockedTabs, setUnlockedTabs] = useState<string[]>([]);
    const [otpModalOpen, setOtpModalOpen] = useState<{isOpen: boolean, targetTab: string}>({isOpen: false, targetTab: ''});
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState('');
    
    // CMS State
    const [uploading, setUploading] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
    
    // AI Content State
    const [liveContent, setLiveContent] = useState({ heroTitle: '', heroSubtitle: '' });
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [isSavingContent, setIsSavingContent] = useState(false);

    // Payments Configuration State
    const [livePayments, setLivePayments] = useState(DEFAULT_PAYMENTS);
    const [isSavingPayments, setIsSavingPayments] = useState(false);

    // AI Diagnostic State
    const [diagVehicle, setDiagVehicle] = useState('');
    const [diagSymptoms, setDiagSymptoms] = useState('');
    const [diagResult, setDiagResult] = useState('');
    const [diagLoading, setDiagLoading] = useState(false);

    // AI Job Comm State
    const [updateMessage, setUpdateMessage] = useState('');
    const [draftingMessage, setDraftingMessage] = useState(false);

    // AI Smart Estimator State
    const [estimatingLead, setEstimatingLead] = useState<Lead | null>(null);
    const [aiEstimate, setAiEstimate] = useState('');
    const [isEstimating, setIsEstimating] = useState(false);

    // V5.0 Features State
    const [jobSearch, setJobSearch] = useState('');

    // Inventory State
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', category: 'Detailing', price: '', stock: '' });

    // Toast & Confirm Modals
    const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{message: string, action: () => void} | null>(null);

    const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const confirmAction = (message: string, action: () => void) => {
        setConfirmDialog({ message, action });
    };

    useEffect(() => {
        if (!user || !db) return;
        const appId = (window as any).__app_id || 'default-app-id';
        const uJobs = onSnapshot(query(collection(db, `artifacts/${appId}/public/data/jobs`), orderBy('jobCardId', 'desc')), (snap) => {
            setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
        });
        const uLeads = onSnapshot(query(collection(db, `artifacts/${appId}/public/data/leads`), orderBy('createdAt', 'desc')), (snap) => {
            setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
        });
        const uProducts = onSnapshot(query(collection(db, `artifacts/${appId}/public/data/inventory`)), (snap) => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        });
        return () => { uJobs(); uLeads(); uProducts(); };
    }, [db, user]);

    useEffect(() => {
        setLiveContent({
            heroTitle: config?.content?.heroTitle || DEFAULT_CONTENT.heroTitle,
            heroSubtitle: config?.content?.heroSubtitle || DEFAULT_CONTENT.heroSubtitle
        });
        if (config?.payments) {
            setLivePayments(config.payments);
        }
    }, [config]);

    const handleSaveContent = async () => {
        setIsSavingContent(true);
        const appId = (window as any).__app_id || 'default-app-id';
        const newConfig = JSON.parse(JSON.stringify(config));
        newConfig.content = liveContent;
        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/settings`, 'global'), { config: newConfig }); 
            setConfig(newConfig);
            setUploadSuccess('content');
            showToast("Live Content successfully updated", "success");
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (e) {
            showToast("Failed to save content", "error");
        } finally {
            setIsSavingContent(false);
        }
    };

    const handleSavePayments = async () => {
        setIsSavingPayments(true);
        const appId = (window as any).__app_id || 'default-app-id';
        const newConfig = JSON.parse(JSON.stringify(config));
        newConfig.payments = livePayments;
        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/settings`, 'global'), { config: newConfig }); 
            setConfig(newConfig);
            setUploadSuccess('payments');
            showToast("Payment & Footer Configuration updated", "success");
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (e) {
            showToast("Failed to save payment configuration", "error");
        } finally {
            setIsSavingPayments(false);
        }
   };

    const callGeminiAPI = async (prompt: string) => {
        const apiKey = "";
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            // This is the correct way to call the Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            // Added the missing equals sign here
            const data = await response.json(); 
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    };

    const handleRunDiagnostics = async () => {
        if (!diagVehicle || !diagSymptoms) return;
        setDiagLoading(true);
        try {
            // Your original diagnostic code should go here
            const prompt = `Vehicle: ${diagVehicle}. Symptoms: ${diagSymptoms}. What are the top 3 most likely causes?`;
            const result = await callGeminiAPI(prompt);
            // Assuming you have a state for the result
            // setDiagResult(result);
            console.log(result);
        } catch (error) {
            console.error(error);
        } finally {
            setDiagLoading(false);
        }
    };

    const handleGenerateEstimate = async () => {
        if (!estimatingLead) return;
        setIsEstimating(true);
        try {
            const prompt = `You are a Master Auto Estimator at Spray Bar in Lesotho. Generate a professional, client-facing quotation for the following customer request:
            Vehicle: ${estimatingLead.vehicle}
            Service Requested: ${estimatingLead.service}
            Customer Notes/Damage: ${estimatingLead.notes || 'No additional notes provided.'}
            
            Provide a concise, professional breakdown including:
            1. Required Parts (Estimates in LSL - Lesotho Loti)
            2. Labor Hours & Cost
            3. Paint & Materials (if applicable)
            4. Subtotal, VAT (15%), and Total Estimated Cost
            Format neatly using standard text. Do not use markdown like **. Keep it brief, polite, and ready to send to a customer.`;
            const result = await callGeminiAPI(prompt);
            setAiEstimate(result);
        } catch (e) {
            setAiEstimate("Error generating estimate. Ensure the API network is available.");
            showToast("Failed to connect to Nexus AI Estimator", "error");
        } finally {
            setIsEstimating(false);
        }
    };

    const handlePushToWMSAndNotify = async () => {
        if (!estimatingLead || !aiEstimate) return;
        setIsSaving(true);
        try {
            const appId = (window as any).__app_id || 'default-app-id';
            const jid = `JC-${1000 + jobs.length + 1}`;

            // 1. Push to WMS as a Job Card under Authorization (Audit Phase)
            await addDoc(collection(db, `artifacts/${appId}/public/data/jobs`), {
                jobCardId: jid,
                customer: estimatingLead.name,
                vehicle: estimatingLead.vehicle,
                serviceType: estimatingLead.service || 'Panel Beating',
                status: "Authorization", // Push to Audit/Authorization phase
                totalRevenue: 0, // Admin updates final revenue after audit
                techAssigned: "Unassigned",
                partsStatus: "Pending Assessment",
                dateIn: new Date().toISOString(),
                aiEstimate: aiEstimate // Attach the AI quote
            });

            // 2. Clear Lead from queue
            await updateDoc(doc(db, `artifacts/${appId}/public/data/leads`, estimatingLead.id), { status: 'Converted' });

            // 3. Trigger WhatsApp Notification
            const waMessage = `Hello ${estimatingLead.name}, this is Spray Bar Auto.\n\nHere is the preliminary professional quotation for your ${estimatingLead.vehicle}:\n\n${aiEstimate}\n\n*Please note this is an AI-generated preliminary quote subject to a physical audit at our workshop.* Reply to this message to book your drop-off!`;
            const cleanPhone = estimatingLead.phone.replace(/[^0-9]/g, '');
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
            window.open(waUrl, '_blank');

            // 4. Cleanup UI
            setEstimatingLead(null);
            setAiEstimate('');
            setActiveTab('jobs');
            showToast(`Quotation pushed to WMS & Client Notified`, "success");
        } catch (error) {
            console.error("Error pushing estimate", error);
            showToast("Failed to push estimate to WMS", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDraftUpdate = async () => {
        if (!editingJob) return;
        setDraftingMessage(true);
        try {
            const prompt = `Write a short, professional, and friendly SMS update to a customer of Spray Bar auto body shop. Their vehicle (${editingJob.vehicle}) is currently in the '${editingJob.status}' phase. The assigned technician is ${editingJob.techAssigned || 'our expert team'}. Do not include placeholders for names, just write the message body directly. Max 3 sentences.`;
            const result = await callGeminiAPI(prompt);
            setUpdateMessage(result);
        } catch(e) {
            setUpdateMessage("Error generating message draft.");
            showToast("Failed to connect to drafting service", "error");
        } finally {
            setDraftingMessage(false);
        }
    };

    const handleAIGenerate = async (field: 'heroTitle' | 'heroSubtitle') => {
        setAiLoading(field);
        try {
            const prompt = field === 'heroTitle'
                ? "Write a short, powerful, high-converting hero website title for Lesotho's first AI-Driven, Green-Tech auto body shop named Spray Bar. Just the title, no quotes, max 6 words. For example: 'The Nexus of Automotive Excellence'."
                : "Write a 2-sentence engaging website hero subtitle for Spray Bar, an AI-Driven, Green-Tech automotive ecosystem. Focus on quality, customer service, and precision repairs. No quotes.";
            
            const text = await callGeminiAPI(prompt);
            if (text) {
                setLiveContent(prev => ({ ...prev, [field]: text.replace(/^"|"$/g, '') }));
                showToast("AI Optimization Complete!", "success");
            }
        } catch (e) {
            showToast("AI Generation failed. Ensure API access is available.", "error");
        } finally {
            setAiLoading(null);
        }
    };

    const handleConvertToJob = async (lead: Lead) => {
        const appId = (window as any).__app_id || 'default-app-id';
        const jid = `JC-${1000 + jobs.length + 1}`;
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/jobs`), {
                jobCardId: jid,
                customer: lead.name,
                vehicle: lead.vehicle,
                serviceType: lead.service || 'Panel Beating',
                status: "Assessment",
                totalRevenue: 0,
                techAssigned: "Unassigned",
                partsStatus: "Pending Assessment",
                dateIn: new Date().toISOString()
            });
            await updateDoc(doc(db, `artifacts/${appId}/public/data/leads`, lead.id), { status: 'Converted' });
            setActiveTab('jobs');
            showToast(`Lead Converted to Job: ${jid}`, "success");
        } catch (e) {
            showToast("Error converting lead.", "error");
        }
    };

    const handleDeleteLead = (id: string) => {
        confirmAction("Are you sure you want to permanently delete this lead?", async () => {
            const appId = (window as any).__app_id || 'default-app-id';
            try { 
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/leads`, id)); 
                showToast("Lead successfully deleted", "success");
            } catch (err) { 
                console.error("Error deleting lead", err); 
                showToast("Failed to delete lead", "error");
            }
        });
    };

    const handleDeleteJob = (id: string) => {
        confirmAction("Are you sure you want to permanently delete this Job Card?", async () => {
            const appId = (window as any).__app_id || 'default-app-id';
            try { 
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/jobs`, id)); 
                showToast("Job Card successfully deleted", "success");
            } catch (err) { 
                console.error("Error deleting job", err); 
                showToast("Failed to delete job", "error");
            }
        });
    };

    const handleSaveJobEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJob) return;
        setIsSaving(true);
        const appId = (window as any).__app_id || 'default-app-id';
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/jobs`, editingJob.id), {
                status: editingJob.status,
                techAssigned: editingJob.techAssigned,
                partsStatus: editingJob.partsStatus,
                totalRevenue: Number(editingJob.totalRevenue)
            });
            setEditingJob(null);
            showToast("Job Card updated successfully", "success");
        } catch (err) {
            console.error("Error saving job", err);
            showToast("Failed to update Job Card", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const appId = (window as any).__app_id || 'default-app-id';
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/inventory`), {
                name: newProduct.name,
                category: newProduct.category,
                price: Number(newProduct.price),
                stock: Number(newProduct.stock)
            });
            setNewProduct({ name: '', category: 'Detailing', price: '', stock: '' });
            setIsAddProductOpen(false);
            showToast("New product added to inventory", "success");
        } catch (err) {
            console.error("Error adding product", err);
            showToast("Failed to add inventory item", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = (id: string) => {
        confirmAction("Are you sure you want to delete this inventory item?", async () => {
            const appId = (window as any).__app_id || 'default-app-id';
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/inventory`, id));
                showToast("Inventory item removed", "success");
            } catch (err) {
                console.error("Error deleting product", err);
                showToast("Failed to remove product", "error");
            }
        });
    };

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, subType?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        
        if (type === 'asset' && (subType === 'companyProfile' || subType === 'serviceCatalog')) {
            if (!isPdf) { showToast("Invalid Format: Please upload a PDF document.", "error"); return; }
            if (file.size > 900000) { showToast("File Too Large: PDFs must be under 900KB.", "error"); return; }
        } else {
            if (!isImage) { showToast("Invalid Format: Please upload a valid image (PNG/JPG/WebP).", "error"); return; }
            if (file.size > 25000000) { showToast("Image Too Large: Images must be under 25MB.", "error"); return; }
        }

        const uploadId = subType || type;
        setUploading(uploadId);
        setUploadSuccess(null);

        try {
            let result: string;
            if (isImage) {
                result = await compressImage(file);
            } else {
                result = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target?.result as string);
                    reader.readAsDataURL(file);
                });
            }

            const appId = (window as any).__app_id || 'default-app-id';
            const newConfig = JSON.parse(JSON.stringify(config));

            if (type === 'asset' && (subType === 'companyProfile' || subType === 'serviceCatalog')) {
                await setDoc(doc(db, `artifacts/${appId}/public/data/assets`, subType), { fileData: result, updatedAt: new Date().toISOString() });
                if (!newConfig.assets) newConfig.assets = {};
                newConfig.assets[subType] = true;
            } else if (isImage) {
                // Save High-Quality images into individual Asset Documents to bypass the 1MB global limit
                const assetId = `${type}_${subType || 'main'}`;
                await setDoc(doc(db, `artifacts/${appId}/public/data/assets`, assetId), { fileData: result, updatedAt: new Date().toISOString() });
                const assetRef = `asset:${assetId}`;

                if (type === 'logo') {
                    if (!newConfig.details) newConfig.details = {};
                    newConfig.details.logoUrl = assetRef;
                } else if (type === 'asset' && subType) {
                    if (!newConfig.assets) newConfig.assets = {};
                    if (subType === 'heroImage') {
                        newConfig.assets[subType] = assetRef;
                    } else {
                        if (!newConfig.assets.serviceImages) newConfig.assets.serviceImages = {};
                        newConfig.assets.serviceImages[subType] = assetRef;
                    }
                }
            }

            await setDoc(doc(db, `artifacts/${appId}/public/data/settings`, 'global'), { config: newConfig }); 
            setConfig(newConfig);
            setUploadSuccess(uploadId);
            showToast("Asset uploaded and saved successfully", "success");
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (err) {
            console.error("Upload error", err);
            showToast("Failed to save asset. Please try again.", "error");
        } finally {
            setUploading(null);
        }
    };

    const handleTabClick = (tabId: string, restricted: boolean = false) => {
        if (restricted && role === 'staff' && !unlockedTabs.includes(tabId)) {
            setOtpModalOpen({ isOpen: true, targetTab: tabId });
        } else {
            setActiveTab(tabId);
        }
        setIsSidebarOpen(false);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // Secure demo OTP for Admin Override
        if (otpInput === '889900') {
            setUnlockedTabs([...unlockedTabs, otpModalOpen.targetTab]);
            setActiveTab(otpModalOpen.targetTab);
            setOtpModalOpen({isOpen: false, targetTab: ''});
            setOtpInput('');
            setOtpError('');
            showToast("System Admin authorization verified. Access granted.", "success");
        } else {
            setOtpError("Invalid OTP entered. Access denied.");
        }
    };

    const PRODUCTION_COLUMNS = [
        { id: 'intake', title: 'Intake & Audit', statuses: ['Assessment', 'Authorization', 'Preparation'], headerClass: 'bg-blue-500/10 border-b border-blue-500/20' },
        { id: 'diagnostics', title: 'Diag & Mech', statuses: ['Diagnostics & AC', 'Mechanical Repair'], headerClass: 'bg-teal-500/10 border-b border-teal-500/20' },
        { id: 'chassis', title: 'Chassis & Susp', statuses: ['Chassis Alignment', 'Suspension & Tyres'], headerClass: 'bg-stone-500/10 border-b border-stone-500/20' },
        { id: 'panel', title: 'Panel Shop', statuses: ['Panel Beating'], headerClass: 'bg-orange-500/10 border-b border-orange-500/20' },
        { id: 'spray', title: 'Spray Bar', statuses: ['Spray Painting'], headerClass: 'bg-indigo-500/10 border-b border-indigo-500/20' },
        { id: 'electrical', title: 'Elect & Fitment', statuses: ['Auto Electrical', 'Auto Glass'], headerClass: 'bg-cyan-500/10 border-b border-cyan-500/20' },
        { id: 'polish', title: 'Polishing', statuses: ['Polishing'], headerClass: 'bg-purple-500/10 border-b border-purple-500/20' },
        { id: 'qc', title: 'QC Bay', statuses: ['Assembly', 'QC Check'], headerClass: 'bg-yellow-500/10 border-b border-yellow-500/20' },
        { id: 'ready', title: 'Ready / Release', statuses: ['Ready'], headerClass: 'bg-green-500/10 border-b border-green-500/20' },
    ];

    const SERVICE_CATEGORIES = [
        { id: 'panel', label: 'Panel Beating' },
        { id: 'paint', label: 'Spray Painting' },
        { id: 'mech', label: 'Mechanical' },
        { id: 'elec', label: 'Auto Electrical' },
        { id: 'polish', label: 'Detailing' },
        { id: 'chassis', label: 'Chassis Alignment' },
        { id: 'glass', label: 'Auto Glass' },
        { id: 'ac', label: 'Air Conditioning' },
        { id: 'diag', label: 'Diagnostics' },
        { id: 'suspension', label: 'Suspension' },
        { id: 'towing', label: 'Towing & Recovery' },
        { id: 'fleet', label: 'Fleet Management' },
        { id: 'tyres', label: 'Tyres & Alignment' },
        { id: 'styling', label: 'Vehicle Styling' },
    ];

    return (
        <div className="flex h-screen bg-[#0f172a] overflow-hidden font-sans">
            {toast && (
                <div className={`fixed top-4 right-4 z-[200] px-6 py-3 rounded-xl shadow-2xl font-bold text-sm uppercase tracking-widest animate-in slide-in-from-top-2 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'}`}>
                    {toast.type === 'error' && <AlertTriangle size={18} />}
                    {toast.type === 'success' && <CheckCircle size={18} />}
                    {toast.type === 'info' && <Info size={18} />}
                    {toast.message}
                </div>
            )}
            
            {confirmDialog && (
                <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-white font-black text-lg mb-2 flex items-center gap-2"><AlertTriangle className="text-orange-500"/> Confirm Action</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">{confirmDialog.message}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-colors border border-slate-700 hover:text-white">Cancel</button>
                            <button onClick={() => { confirmDialog.action(); setConfirmDialog(null); }} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-[10px] uppercase tracking-widest font-black shadow-lg shadow-red-900/20 transition-colors">Confirm Proceed</button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP ADMIN OVERRIDE MODAL */}
            {otpModalOpen.isOpen && (
                <div className="fixed inset-0 z-[200] bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="p-8 text-center relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20 mx-auto mb-4">
                                <KeyRound size={28} className="text-white" />
                            </div>
                            <h3 className="font-black text-xl text-white uppercase tracking-tight mb-2">Restricted Access</h3>
                            <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">This module requires elevated permissions. Please enter the System Admin OTP sent to the supervisor's phone to temporarily unlock.</p>
                            
                            <form onSubmit={handleVerifyOtp}>
                                <input 
                                    type="password" 
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP" 
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-4 rounded-xl text-center font-mono font-black text-xl tracking-[0.5em] focus:border-blue-500 outline-none transition-colors mb-2"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                />
                                {otpError && <p className="text-red-500 text-[10px] font-black uppercase mb-4">{otpError}</p>}
                                
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => { setOtpModalOpen({isOpen: false, targetTab: ''}); setOtpInput(''); setOtpError(''); }} className="flex-1 py-3 text-slate-400 font-bold uppercase text-xs hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-blue-900/20">Verify Access</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Sidebar */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-72 bg-[#020617] text-slate-300 flex flex-col border-r border-slate-800/60 shadow-2xl`}>
                <div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <Cpu size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="font-black text-white text-xl tracking-tight leading-none">NEXUS-WMS</div>
                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Master Autotech Pro</div>
                        </div>
                    </div>
                    <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
                </div>

                <div className="p-4 bg-slate-900/50 border-b border-slate-800/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <UserCheck size={14} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-white uppercase tracking-widest">Active Profile</div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${role === 'admin' ? 'text-green-400' : 'text-blue-400'}`}>
                            {role === 'admin' ? <ShieldCheck size={10} /> : <UserCog size={10} />} {role.toUpperCase()} SESSION
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-2">Core Modules</div>
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Command Center' },
                        { id: 'leads', icon: Target, label: 'Web Leads Queue', badge: leads.filter(l => l.status === 'New Lead').length },
                        { id: 'jobs', icon: Wrench, label: 'Production Manager', badge: jobs.filter(j => j.status !== 'Closed').length },
                        { id: 'retail', icon: ShoppingCart, label: 'Retail Inventory', restricted: true },
                        { id: 'analytics', icon: Activity, label: 'Performance Analytics' },
                        { id: 'ai-assist', icon: Bot, label: 'AI Diagnostic Hub' },
                    ].map(t => {
                        const isRestricted = t.restricted && role === 'staff' && !unlockedTabs.includes(t.id);
                        return (
                            <button key={t.id} onClick={() => handleTabClick(t.id, t.restricted)} className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/50 hover:text-white'}`}>
                                <div className="flex items-center gap-3">
                                    <t.icon size={18} className={isRestricted ? 'text-slate-500' : ''} /> 
                                    <span className={isRestricted ? 'text-slate-400' : ''}>{t.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isRestricted && <Lock size={12} className="text-orange-500 opacity-80" />}
                                    {!isRestricted && t.restricted && role === 'staff' && <Unlock size={12} className="text-green-400 opacity-80" />}
                                    {t.badge ? <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-md text-blue-400 border border-slate-700">{t.badge}</span> : null}
                                </div>
                            </button>
                        );
                    })}
                    
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-2 mt-8">System Configuration</div>
                    {[
                        { id: 'settings', icon: Settings, label: 'API & Integrations', restricted: true },
                    ].map(t => {
                        const isRestricted = t.restricted && role === 'staff' && !unlockedTabs.includes(t.id);
                        return (
                            <button key={t.id} onClick={() => handleTabClick(t.id, t.restricted)} className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800/50 hover:text-white'}`}>
                                <div className="flex items-center gap-3">
                                    <t.icon size={18} className={isRestricted ? 'text-slate-500' : ''} /> 
                                    <span className={isRestricted ? 'text-slate-400' : ''}>{t.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isRestricted && <Lock size={12} className="text-orange-500 opacity-80" />}
                                    {!isRestricted && t.restricted && role === 'staff' && <Unlock size={12} className="text-green-400 opacity-80" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800/60">
                    <button onClick={onExit} className="w-full flex items-center justify-center gap-2 p-3 text-slate-400 font-bold text-xs uppercase hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
                        <LogOut size={16} /> Secure Logout
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-auto bg-[#0f172a] p-4 md:p-8 text-slate-300 relative w-full">
                <header className="flex justify-between items-center mb-8 pt-2 md:pt-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-300" onClick={() => setIsSidebarOpen(true)}><MenuIcon size={24}/></button>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">{activeTab === 'dashboard' ? 'Command Center' : activeTab === 'jobs' ? 'Production Master' : activeTab === 'retail' ? 'Retail Inventory' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                            <p className="text-[10px] md:text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">NEXUS | PROD V5.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-blue-900/20 px-4 py-2 rounded-full border border-blue-500/30">
                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">V5.0 Nexus Engine Active</span>
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* V5.0 System Health Banner */}
                        <div className="bg-gradient-to-r from-blue-900/40 to-slate-900/40 border border-blue-500/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 text-blue-400">
                                    <Server size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Nexus V5.0 Production Core</h4>
                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">All systems operating optimally. Master Autotech AI link stable.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-xl font-black text-white">99.9%</div>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Uptime</div>
                                </div>
                                <div className="w-px h-8 bg-slate-700/50 my-auto"></div>
                                <div className="text-center">
                                    <div className="text-xl font-black text-green-400">14ms</div>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">AI Latency</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Wrench size={12}/> Active WIP</p>
                                <h4 className="text-4xl font-black text-white">{jobs.filter(j => j.status !== 'Closed').length}</h4>
                            </div>
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={12}/> Pending Web Leads</p>
                                <h4 className="text-4xl font-black text-orange-400">{leads.filter(l => l.status === 'New Lead').length}</h4>
                            </div>
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={12}/> Est. Revenue pipeline</p>
                                <h4 className="text-3xl font-black text-green-400">{formatCurrency(jobs.reduce((a,b) => a + (Number(b.totalRevenue) || 0), 0))}</h4>
                            </div>
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={12}/> Workshop Efficiency</p>
                                <h4 className="text-4xl font-black text-blue-400">94.2%</h4>
                            </div>
                        </div>

                        {/* LIVE PRODUCTION FLOW (KANBAN) */}
                        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm mt-6">
                            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Layers size={16} className="text-blue-500"/> Live Production Flow 
                                    <span className="text-[10px] text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full ml-2 animate-pulse flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> Live Feed</span>
                                </h3>
                            </div>
                            <div className="p-6 overflow-x-auto pb-8">
                                <div className="flex gap-4 min-w-max">
                                    {PRODUCTION_COLUMNS.map(col => {
                                        const colJobs = jobs.filter(j => col.statuses.includes(j.status));
                                        return (
                                            <div key={col.id} className="w-72 flex flex-col bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden shrink-0 shadow-lg shadow-black/20">
                                                <div className={`p-4 flex flex-col gap-2 ${col.headerClass}`}>
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-xs font-black uppercase text-white tracking-widest">{col.title}</h4>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 bg-slate-950/50 px-2 py-1 rounded-md self-start border border-slate-800/50">
                                                        Occupancy: <span className="text-white ml-1">{colJobs.length} Units</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 flex-1 space-y-3 min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar">
                                                    {colJobs.map(j => (
                                                        <div key={j.id} className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-sm hover:border-slate-500 transition-colors group cursor-pointer" onClick={() => { setActiveTab('jobs'); setEditingJob(j); }}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="text-[10px] font-mono text-blue-400 font-bold bg-blue-900/20 px-1.5 py-0.5 rounded">{j.jobCardId}</div>
                                                                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white shadow-sm" title={`Tech: ${j.techAssigned || 'Unassigned'}`}>{(j.techAssigned || 'U')[0]}</div>
                                                            </div>
                                                            <div className="text-sm font-black text-white truncate mb-1">{j.vehicle}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 truncate mb-3">{j.customer}</div>
                                                            <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                                <span>Status:</span>
                                                                <span className="text-slate-300">{j.status}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {colJobs.length === 0 && (
                                                        <div className="h-32 flex flex-col items-center justify-center text-[10px] font-bold text-slate-600 uppercase tracking-widest border-2 border-dashed border-slate-700/50 rounded-lg p-4 text-center bg-slate-900/20">
                                                            <CheckCircle size={20} className="mb-2 opacity-50 text-slate-500" />
                                                            Zone Empty
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr><th className="p-5 border-b border-slate-700">Client Details</th><th className="p-5 border-b border-slate-700">Vehicle</th><th className="p-5 border-b border-slate-700">Service Request</th><th className="p-5 border-b border-slate-700">Type</th><th className="p-5 border-b border-slate-700">Status</th><th className="p-5 border-b border-slate-700 text-right">Action</th></tr>
                                </thead>
                                <tbody className="text-sm">
                                    {leads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-slate-800/80 transition-colors">
                                            <td className="p-5 border-b border-slate-800/50">
                                                <div className="font-bold text-white">{lead.name}</div>
                                                <div className="text-[10px] text-blue-400 font-bold tracking-wider">{lead.phone}</div>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50 font-bold text-slate-400">{lead.vehicle}</td>
                                            <td className="p-5 border-b border-slate-800/50 font-bold text-slate-400 text-xs">{lead.service}</td>
                                            <td className="p-5 border-b border-slate-800/50">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${lead.requestType === 'booking' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{lead.requestType}</span>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lead.status}</span></td>
                                            <td className="p-5 border-b border-slate-800/50">
                                                <div className="flex items-center justify-end gap-2">
                                                    {lead.status === 'New Lead' && (
                                                        <>
                                                            <button onClick={() => { setEstimatingLead(lead); setAiEstimate(''); }} className="inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 shadow-lg shadow-purple-900/20 transition-all" title="AI Smart Estimator">
                                                                <Wand2 size={14} /> Est
                                                            </button>
                                                            <button onClick={() => handleConvertToJob(lead)} className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">
                                                                <Cpu size={14} /> Init
                                                            </button>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleDeleteLead(lead.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-slate-800 transition-colors" title="Delete Lead">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {leads.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No incoming leads detected.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom-2">
                        <div className="p-4 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/30 gap-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Production Floor Overview</h3>
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                    <input 
                                        type="text" 
                                        placeholder="Search Ref or Vehicle..." 
                                        className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-3 py-2 rounded-xl text-xs font-bold focus:border-blue-500 outline-none"
                                        value={jobSearch}
                                        onChange={(e) => setJobSearch(e.target.value)}
                                    />
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 flex gap-4 shrink-0">
                                    <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span> active</span>
                                    <span><span className="inline-block w-2 h-2 rounded-full bg-slate-600 mr-1"></span> closed</span>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr><th className="p-5 border-b border-slate-700">Reference</th><th className="p-5 border-b border-slate-700">Vehicle / Client</th><th className="p-5 border-b border-slate-700">Service Type</th><th className="p-5 border-b border-slate-700">Assigned Tech</th><th className="p-5 border-b border-slate-700">Parts Status</th><th className="p-5 border-b border-slate-700">Production Phase</th><th className="p-5 border-b border-slate-700 text-right">Action</th></tr>
                                </thead>
                                <tbody className="text-sm">
                                    {jobs.filter(j => 
                                        jobSearch === '' || 
                                        j.jobCardId.toLowerCase().includes(jobSearch.toLowerCase()) || 
                                        j.vehicle.toLowerCase().includes(jobSearch.toLowerCase()) ||
                                        j.customer.toLowerCase().includes(jobSearch.toLowerCase())
                                    ).map(j => (
                                        <tr key={j.id} className={`hover:bg-slate-800/80 transition-colors group ${j.status === 'Closed' ? 'opacity-50' : ''}`}>
                                            <td className="p-5 border-b border-slate-800/50 font-mono font-bold text-blue-400">{j.jobCardId}</td>
                                            <td className="p-5 border-b border-slate-800/50">
                                                <div className="font-bold text-white">{j.vehicle}</div>
                                                <div className="text-[10px] text-slate-500 font-bold tracking-wider">{j.customer}</div>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50 font-bold text-xs text-slate-400">{j.serviceType || 'General Repair'}</td>
                                            <td className="p-5 border-b border-slate-800/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">{(j.techAssigned || 'U')[0]}</div>
                                                    <span className="text-xs font-bold text-slate-300">{j.techAssigned || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50 font-bold text-xs text-slate-400">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest border ${j.partsStatus === 'Parts Received' ? 'text-green-400 border-green-500/30 bg-green-500/10' : j.partsStatus === 'Parts Ordered' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' : 'text-slate-400 border-slate-700 bg-slate-800'}`}>
                                                    {j.partsStatus || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50">
                                                <span className="bg-slate-900 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-900/50 text-[10px] font-black uppercase tracking-widest shadow-inner">{j.status}</span>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setEditingJob(j)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg border border-slate-700 hover:border-blue-500">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteJob(j.id)} className="text-slate-500 hover:text-red-400 transition-colors bg-slate-800 p-2 rounded-lg border border-slate-700 hover:border-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {jobs.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-bold">No active job cards in the system.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- RETAIL MODULE --- */}
                {activeTab === 'retail' && (
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom-2">
                         <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Retail Inventory</h3>
                            <button onClick={() => setIsAddProductOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">
                                + Add Product
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-5 border-b border-slate-700">Product Name</th>
                                        <th className="p-5 border-b border-slate-700">Category</th>
                                        <th className="p-5 border-b border-slate-700">Retail Price</th>
                                        <th className="p-5 border-b border-slate-700">Stock Level</th>
                                        <th className="p-5 border-b border-slate-700 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {products.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-800/80 transition-colors">
                                            <td className="p-5 border-b border-slate-800/50">
                                                <div className="font-bold text-white">{p.name}</div>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50">
                                                <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50 font-bold text-slate-300">
                                                {formatCurrency(p.price)}
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50">
                                                <span className={`font-black flex items-center gap-2 ${p.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {p.stock} Units
                                                    {p.stock < 10 && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                                                </span>
                                            </td>
                                            <td className="p-5 border-b border-slate-800/50 text-right">
                                                <button 
                                                    onClick={() => handleDeleteProduct(p.id)} 
                                                    className="text-slate-500 hover:text-red-400 transition-colors bg-slate-800 p-2 rounded-lg border border-slate-700 hover:border-red-500/50" 
                                                    title="Delete inventory item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                                                No products in inventory. Click "+ Add Product" to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- ANALYTICS MODULE --- */}
                {activeTab === 'analytics' && (() => {
                    const totalRevenue = jobs.reduce((a, b) => a + (Number(b.totalRevenue) || 0), 0);
                    const revBySource = jobs.reduce((acc, job) => {
                        const s = job.serviceType || 'General Repair';
                        acc[s] = (acc[s] || 0) + (Number(job.totalRevenue) || 0);
                        return acc;
                    }, {} as Record<string, number>);
                    
                    const chartColors = ['bg-blue-500', 'bg-indigo-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500', 'bg-teal-500'];

                    // Calculate real weekly throughput from live Job Cards
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const currentWeekJobs = new Array(7).fill(0);
                    jobs.forEach(j => {
                        if(j.dateIn) {
                            const d = new Date(j.dateIn);
                            // Filter to jobs created in the last 7 days
                            const diffTime = Math.abs(new Date().getTime() - d.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                            if(diffDays <= 7) {
                                currentWeekJobs[d.getDay()]++;
                            }
                        }
                    });
                    const maxJobs = Math.max(...currentWeekJobs, 1);
                    // Reorder visual display so Monday is first
                    const orderedDays = [1, 2, 3, 4, 5, 6, 0];

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2">
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><PieChart size={16}/> Revenue by Source (Live)</h3>
                                <div className="space-y-4">
                                    {Object.entries(revBySource).sort((a,b) => b[1] - a[1]).map(([source, amount], idx) => {
                                        const percent = totalRevenue === 0 ? 0 : Math.round((amount / totalRevenue) * 100);
                                        return (
                                            <div key={source}>
                                                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                                    <span>{source}</span>
                                                    <span>{percent}% ({formatCurrency(amount)})</span>
                                                </div>
                                                <div className="w-full bg-slate-900 rounded-full h-2">
                                                    <div className={`${chartColors[idx % chartColors.length]} h-2 rounded-full transition-all duration-1000`} style={{width: `${percent}%`}}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {jobs.length === 0 || totalRevenue === 0 ? (
                                        <p className="text-xs text-slate-500 italic text-center py-4">No revenue data available yet. Start completing jobs to see metrics.</p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><BarChart3 size={16}/> Weekly Throughput (Last 7 Days)</h3>
                                <div className="flex items-end justify-between h-40 gap-2 pb-2">
                                    {orderedDays.map((dayIdx) => {
                                        const h = (currentWeekJobs[dayIdx] / maxJobs) * 100;
                                        const val = currentWeekJobs[dayIdx];
                                        return (
                                            <div key={dayIdx} className="w-full bg-blue-600/20 rounded-t-sm relative group hover:bg-blue-600/40 transition-colors" style={{height: `${Math.max(h, 5)}%`}}>
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">{val > 0 ? val : ''}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mt-2 pt-2 border-t border-slate-700/50">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* --- AI DIAGNOSTIC HUB --- */}
                {activeTab === 'ai-assist' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 pb-12">
                        <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <Bot className="text-blue-500" /> Nexus AI Diagnostics
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">LLM-Powered Mechanic Assistant</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-6">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-700/50 pb-4">
                                    <Car size={16} className="text-blue-500"/> Vehicle & Symptoms
                                </h4>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle Make, Model, & Year</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 2018 Toyota Hilux 2.8 GD-6"
                                        className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
                                        value={diagVehicle}
                                        onChange={e => setDiagVehicle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observed Symptoms or OBD2 Codes</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="e.g. Rough idle, P0300 code, smells like burning rubber near the belt..."
                                        className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none resize-none placeholder:text-slate-600"
                                        value={diagSymptoms}
                                        onChange={e => setDiagSymptoms(e.target.value)}
                                    ></textarea>
                                </div>
                                <button 
                                    onClick={handleRunDiagnostics} 
                                    disabled={diagLoading || !diagVehicle || !diagSymptoms} 
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    {diagLoading ? <Loader2 className="animate-spin" size={16} /> : '✨ Run AI Diagnostics'}
                                </button>
                            </div>

                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-4 flex flex-col">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-700/50 pb-4">
                                    <Cpu size={16} className="text-green-500"/> AI Analysis Report
                                </h4>
                                <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 overflow-y-auto whitespace-pre-wrap text-sm text-slate-300 font-medium font-sans">
                                    {diagResult ? diagResult : <span className="text-slate-600 italic">Enter vehicle details and symptoms on the left to generate an AI diagnostic report.</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SETTINGS MODULE (CMS) --- */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 pb-12">
                        <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">CMS Configuration</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage Website Assets & Branding</p>
                            </div>
                            <div className="hidden sm:flex bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl items-center gap-2">
                                <ShieldCheck size={16} className="text-blue-400" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Master Edit Access</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Branding & Hero */}
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-6">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-700/50 pb-4"><ImageIcon size={16} className="text-blue-500"/> Branding & Hero Assets</h4>
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex justify-between">Brand Logo {uploadSuccess === 'logo' && <span className="text-green-400">Updated!</span>}</label>
                                    <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                                            {uploading === 'logo' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-500" size={20}/></div>}
                                            <FirestoreImage src={config?.details?.logoUrl} fallback={IMAGES.LOGO} className="max-w-full max-h-full object-contain" alt="Logo" db={db} />
                                        </div>
                                        <div className="flex-1">
                                            <button onClick={() => fileInputRefs.current['logo']?.click()} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors w-full flex items-center justify-center gap-2"><Upload size={14}/> Upload Logo</button>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 text-center">Format: PNG, JPG (Max 25MB)</p>
                                        </div>
                                        <input type="file" ref={el => fileInputRefs.current['logo'] = el} className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleAssetUpload(e, 'logo')} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex justify-between">Homepage Hero Banner {uploadSuccess === 'heroImage' && <span className="text-green-400">Updated!</span>}</label>
                                    <div onClick={() => fileInputRefs.current['hero']?.click()} className="relative h-40 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden group cursor-pointer">
                                        {uploading === 'heroImage' && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-500" size={24}/></div>}
                                        <FirestoreImage src={config?.assets?.heroImage} fallback={IMAGES.HERO_SPRAY} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Hero" db={db} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-slate-900/80 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:scale-105 transition-transform"><Upload size={14}/> Upload Hero Image</div>
                                        </div>
                                        <input type="file" ref={el => fileInputRefs.current['hero'] = el} className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleAssetUpload(e, 'asset', 'heroImage')} />
                                    </div>
                                </div>
                            </div>

                            {/* Marketing Content & AI Automation */}
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-6 flex flex-col">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-between border-b border-slate-700/50 pb-4">
                                    <span className="flex items-center gap-2"><Type size={16} className="text-green-500"/> Live Content & AI Copy</span>
                                    {uploadSuccess === 'content' && <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">Changes Live</span>}
                                </h4>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex justify-between items-center">
                                        Website Headline
                                        <button onClick={() => handleAIGenerate('heroTitle')} disabled={aiLoading !== null} className="flex items-center gap-1 text-[9px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30 transition-colors">
                                            {aiLoading === 'heroTitle' ? <Loader2 className="animate-spin" size={12}/> : <Wand2 size={12}/>} AI Optimize
                                        </button>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={liveContent.heroTitle}
                                        onChange={e => setLiveContent({...liveContent, heroTitle: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl font-black text-lg focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-2 flex-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex justify-between items-center">
                                        Hero Subtitle / Description
                                        <button onClick={() => handleAIGenerate('heroSubtitle')} disabled={aiLoading !== null} className="flex items-center gap-1 text-[9px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30 transition-colors">
                                            {aiLoading === 'heroSubtitle' ? <Loader2 className="animate-spin" size={12}/> : <Wand2 size={12}/>} AI Optimize
                                        </button>
                                    </label>
                                    <textarea 
                                        rows={4}
                                        value={liveContent.heroSubtitle}
                                        onChange={e => setLiveContent({...liveContent, heroSubtitle: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 text-slate-300 p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <button onClick={handleSaveContent} disabled={isSavingContent} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 mt-auto">
                                    {isSavingContent ? <Loader2 className="animate-spin" size={16} /> : 'Save Content to Live Site'}
                                </button>
                            </div>

                            {/* Company Documents */}
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-6">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-700/50 pb-4"><FileText size={16} className="text-orange-500"/> Company Documents</h4>
                                
                                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Company Profile</p>
                                        <p className={`text-[10px] font-bold uppercase flex items-center gap-1 ${config?.assets?.companyProfile ? 'text-green-400' : 'text-slate-500'}`}>
                                            {config?.assets?.companyProfile ? <><CheckCircle size={12}/> Document Active</> : 'No document uploaded'}
                                        </p>
                                    </div>
                                    <button onClick={() => fileInputRefs.current['profile']?.click()} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                                        {uploading === 'companyProfile' ? <Loader2 className="animate-spin text-orange-500" size={14}/> : <><Upload size={14}/> Upload PDF</>}
                                    </button>
                                    <input type="file" ref={el => fileInputRefs.current['profile'] = el} className="hidden" accept="application/pdf" onChange={(e) => handleAssetUpload(e, 'asset', 'companyProfile')} />
                                </div>

                                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Service Catalog</p>
                                        <p className={`text-[10px] font-bold uppercase flex items-center gap-1 ${config?.assets?.serviceCatalog ? 'text-green-400' : 'text-slate-500'}`}>
                                            {config?.assets?.serviceCatalog ? <><CheckCircle size={12}/> Document Active</> : 'No document uploaded'}
                                        </p>
                                    </div>
                                    <button onClick={() => fileInputRefs.current['catalog']?.click()} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                                        {uploading === 'serviceCatalog' ? <Loader2 className="animate-spin text-orange-500" size={14}/> : <><Upload size={14}/> Upload PDF</>}
                                    </button>
                                    <input type="file" ref={el => fileInputRefs.current['catalog'] = el} className="hidden" accept="application/pdf" onChange={(e) => handleAssetUpload(e, 'asset', 'serviceCatalog')} />
                                </div>
                            </div>

                            {/* Financial & Platform Integrations */}
                            <div className="col-span-1 xl:col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-6">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-between border-b border-slate-700/50 pb-4">
                                    <span className="flex items-center gap-2"><CreditCard size={16} className="text-blue-500"/> Financial & Platform Integrations</span>
                                    {uploadSuccess === 'payments' && <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">Changes Live</span>}
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* M-Pesa */}
                                    <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Smartphone size={14} className="text-red-500"/> M-Pesa Settings</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Number" value={livePayments.mpesaNumber} onChange={e => setLivePayments({...livePayments, mpesaNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                            <input type="text" placeholder="Name" value={livePayments.mpesaName} onChange={e => setLivePayments({...livePayments, mpesaName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>

                                    {/* EcoCash */}
                                    <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Smartphone size={14} className="text-blue-500"/> EcoCash Settings</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Number" value={livePayments.ecocashNumber} onChange={e => setLivePayments({...livePayments, ecocashNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                            <input type="text" placeholder="Name" value={livePayments.ecocashName} onChange={e => setLivePayments({...livePayments, ecocashName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>

                                    {/* EFT Bank details */}
                                    <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Landmark size={14} className="text-green-500"/> Bank Transfer / EFT Settings</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <input type="text" placeholder="Bank Name" value={livePayments.bankName} onChange={e => setLivePayments({...livePayments, bankName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                            <input type="text" placeholder="Account Number" value={livePayments.bankAcc} onChange={e => setLivePayments({...livePayments, bankAcc: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                            <input type="text" placeholder="Branch Code" value={livePayments.bankBranch} onChange={e => setLivePayments({...livePayments, bankBranch: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>

                                    {/* Card Notes & Footer */}
                                    <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><CreditCard size={14} className="text-slate-400"/> Visa / Mastercard Instructions</label>
                                        <textarea rows={2} value={livePayments.cardNotes} onChange={e => setLivePayments({...livePayments, cardNotes: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-300 p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none resize-none"></textarea>
                                    </div>
                                    
                                    <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Type size={14} className="text-purple-400"/> Footer Company Name</label>
                                        <input type="text" placeholder="Company Name for Footer" value={livePayments.footerName} onChange={e => setLivePayments({...livePayments, footerName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                </div>

                                <button onClick={handleSavePayments} disabled={isSavingPayments} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                    {isSavingPayments ? <Loader2 className="animate-spin" size={16} /> : 'Save Financial Integrations'}
                                </button>
                            </div>
                        </div>

                        {/* Service Showcase Photos Grid */}
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-700/50 pb-4 mb-6"><Camera size={16} className="text-green-500"/> Service Showcase Photos</h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {SERVICE_CATEGORIES.map(service => (
                                    <div key={service.id} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex justify-between items-center">
                                            <span className="truncate pr-2">{service.label}</span>
                                            {uploadSuccess === service.id && <span className="text-green-400 flex-shrink-0 animate-pulse"><Check size={12}/></span>}
                                        </label>
                                        <div onClick={() => fileInputRefs.current[service.id]?.click()} className="relative h-28 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-colors">
                                            {uploading === service.id && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10"><Loader2 className="animate-spin text-blue-500" size={20}/></div>}
                                            <FirestoreImage src={config?.assets?.serviceImages?.[service.id]} fallback={DEFAULT_ASSETS.serviceImages[service.id as keyof typeof DEFAULT_ASSETS.serviceImages] || IMAGES.HERO_SPRAY} className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity" alt={service.label} db={db} />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-slate-900 text-white p-2 rounded-full shadow-lg border border-slate-700"><Upload size={16} /></div>
                                            </div>
                                        </div>
                                        <input type="file" ref={el => fileInputRefs.current[service.id] = el} className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleAssetUpload(e, 'asset', service.id)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- ADD PRODUCT MODAL --- */}
            {isAddProductOpen && (
                <div className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight flex items-center gap-2"><TagIcon size={20} className="text-blue-500"/> Add Inventory Item</h3>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Drive Master Retail Catalog</p>
                            </div>
                            <button onClick={() => setIsAddProductOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddProduct} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">Product Name</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. Premium Auto Wax"
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">Category</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                                >
                                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><DollarSign size={14}/> Retail Price</label>
                                    <input 
                                        required
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full bg-slate-950 border border-slate-700 text-green-400 p-3 rounded-xl font-black focus:border-blue-500 outline-none placeholder:text-slate-600"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Package size={14}/> Initial Stock</label>
                                    <input 
                                        required
                                        type="number" 
                                        min="0"
                                        placeholder="0"
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold focus:border-blue-500 outline-none placeholder:text-slate-600"
                                        value={newProduct.stock}
                                        onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4 border-t border-slate-800">
                                <button type="button" onClick={() => setIsAddProductOpen(false)} className="flex-1 py-3 text-slate-400 font-bold uppercase text-xs hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- JOB EDIT MODAL (PRODUCTION) --- */}
            {editingJob && (
                <div className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight flex items-center gap-2"><ClipboardList size={20} className="text-blue-500"/> Update Job Card</h3>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Ref: {editingJob.jobCardId} | {editingJob.vehicle}</p>
                            </div>
                            <button onClick={() => setEditingJob(null)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveJobEdit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Hammer size={14}/> Production Phase</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
                                    value={editingJob.status}
                                    onChange={e => setEditingJob({...editingJob, status: e.target.value})}
                                >
                                    {JOB_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><UserCog size={14}/> Assigned Tech</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
                                        value={editingJob.techAssigned || 'Unassigned'}
                                        onChange={e => setEditingJob({...editingJob, techAssigned: e.target.value})}
                                    >
                                        {TECH_TEAM.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><CheckSquare size={14}/> Parts Status</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl font-bold focus:border-blue-500 outline-none"
                                        value={editingJob.partsStatus || 'Pending Assessment'}
                                        onChange={e => setEditingJob({...editingJob, partsStatus: e.target.value})}
                                    >
                                        {PARTS_STATUS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><DollarSign size={14}/> Estimated Repair Value (LSL)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-950 border border-slate-700 text-green-400 p-3 rounded-xl font-black focus:border-blue-500 outline-none"
                                    value={editingJob.totalRevenue || 0}
                                    onChange={e => setEditingJob({...editingJob, totalRevenue: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 pb-2 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <MessageSquare size={14} className="text-orange-500" /> Customer Communications
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={handleDraftUpdate}
                                        disabled={draftingMessage}
                                        className="text-[9px] bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                                    >
                                        {draftingMessage ? <Loader2 className="animate-spin" size={12}/> : '✨ Auto-Draft Update'}
                                    </button>
                                </div>
                                <textarea 
                                    rows={3}
                                    placeholder="Click the button above to generate a professional update message based on the current job status..."
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 rounded-xl font-bold text-xs focus:border-blue-500 outline-none resize-none"
                                    value={updateMessage}
                                    onChange={e => setUpdateMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-4 border-t border-slate-800">
                                <button type="button" onClick={() => { setEditingJob(null); setUpdateMessage(''); }} className="flex-1 py-3 text-slate-400 font-bold uppercase text-xs hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : 'Save Job Card'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- AI SMART ESTIMATOR MODAL --- */}
            {estimatingLead && (
                <div className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 shrink-0">
                            <div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight flex items-center gap-2"><Calculator size={20} className="text-purple-500"/> AI Smart Estimator</h3>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1">Client: {estimatingLead.name} | {estimatingLead.vehicle}</p>
                            </div>
                            <button onClick={() => { setEstimatingLead(null); setAiEstimate(''); }} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Requested Service</span>
                                    <span className="text-sm font-bold text-white">{estimatingLead.service}</span>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-24 custom-scrollbar">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Customer Notes</span>
                                    <span className="text-sm font-bold text-slate-300">{estimatingLead.notes || 'None provided'}</span>
                                </div>
                            </div>

                            <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col min-h-[300px]">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-purple-500/20">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Bot size={16} className="text-purple-400"/> AI Breakdown
                                    </h4>
                                    {!aiEstimate && !isEstimating && (
                                        <button 
                                            onClick={handleGenerateEstimate}
                                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-colors shadow-lg shadow-purple-900/20 flex items-center gap-2"
                                        >
                                            <Wand2 size={14} /> Generate Est.
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm text-slate-300 font-medium font-sans custom-scrollbar">
                                    {isEstimating ? (
                                        <div className="flex flex-col items-center justify-center h-full text-purple-400 space-y-4 py-8">
                                            <Loader2 className="animate-spin" size={32} />
                                            <p className="text-xs font-black uppercase tracking-widest">Analyzing requested damage & parts...</p>
                                        </div>
                                    ) : aiEstimate ? (
                                        aiEstimate
                                    ) : (
                                        <span className="text-slate-600 italic">Click generate to calculate a rough structural, mechanical, or paint estimate using Nexus AI. Ensure the client provided clear vehicle and damage notes.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-800/50 shrink-0 flex gap-4">
                            <button onClick={() => { setEstimatingLead(null); setAiEstimate(''); }} className="flex-1 py-3 text-slate-400 font-bold uppercase text-xs hover:bg-slate-800 rounded-xl transition-colors">Close</button>
                            {aiEstimate && (
                                <>
                                    <button onClick={() => {
                                        const textArea = document.createElement("textarea");
                                        textArea.value = aiEstimate;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        try {
                                            document.execCommand('copy');
                                            showToast("Estimate copied to clipboard", "success");
                                        } catch (err) {
                                            showToast("Failed to copy estimate", "error");
                                        }
                                        document.body.removeChild(textArea);
                                    }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2">
                                        <Copy size={16} /> Copy Quote
                                    </button>
                                    <button onClick={handlePushToWMSAndNotify} disabled={isSaving} className="flex-[2] bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">
                                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Push to WMS & WhatsApp</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SprayBarIntegrated() {
  const [view, setView] = useState<'WEBSITE' | 'WMS' | 'LOGIN'>('WEBSITE');
  const [wmsRole, setWmsRole] = useState<'admin' | 'staff'>('staff');
  const [user, setUser] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>({ details: DEFAULT_COMPANY_DETAILS, assets: DEFAULT_ASSETS, content: DEFAULT_CONTENT });

  useEffect(() => {
    // 1. Paste YOUR actual Firebase config here
   const firebaseConfig = {
  apiKey: "AIzaSyDqA30L_af9Qw4KWFqvRTjzCmCZFqWKfjM",
  authDomain: "nexus-wms-777d6.firebaseapp.com",
  projectId: "nexus-wms-777d6",
  storageBucket: "nexus-wms-777d6.firebasestorage.app",
  messagingSenderId: "547372260070",
  appId: "1:547372260070:web:10439e3ceecf64f4ad7927",
  measurementId: "G-79R57VR4K8"
};

    try {
      const app = initializeApp(firebaseConfig);
      const database = getFirestore(app);
      setDb(database);
      
      const auth = getAuth(app);
      // Optional: Log them in anonymously so they can read/write data
      signInAnonymously(auth).catch(console.error);
      
      onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
    } catch (error) {
      console.error("Firebase init error:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const appId = (window as any).__app_id || 'default-app-id';
    return onSnapshot(collection(db, `artifacts/${appId}/public/data/settings`), (snap) => {
        const globalSettings = snap.docs.find(d => d.id === 'global');
        if (globalSettings) setConfig(globalSettings.data().config);
        setLoading(false);
    });
  }, [user, db]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <>
        {view === 'WEBSITE' && <WebsiteView db={db} onLogin={() => setView('LOGIN')} config={config} />}
        {view === 'LOGIN' && <LoginView onLoginSuccess={(role) => { setWmsRole(role); setView('WMS'); }} onCancel={() => setView('WEBSITE')} />}
        {view === 'WMS' && <WMSView db={db} user={user} role={wmsRole} onExit={() => setView('WEBSITE')} config={config} setConfig={setConfig} />}
    </>
  );
}

const LoginView = ({ onLoginSuccess, onCancel }: { onLoginSuccess: (role: 'admin' | 'staff') => void, onCancel: () => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            if (username.toLowerCase() === 'admin' && password === 'Nexus@Admin99!') onLoginSuccess('admin');
            else if (username.toLowerCase() === 'staff' && password === 'SBH@2025') onLoginSuccess('staff');
            else { setError('Invalid Credentials. Use ID: admin or staff'); setIsSubmitting(false); }
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4">
                        <Cpu size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black uppercase text-center text-white tracking-tight">NEXUS-WMS</h2>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Authentication Portal</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Operator ID (admin / staff)</label>
                        <input placeholder="Enter ID" className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-xl font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Passcode</label>
                        <input type="password" placeholder="Enter Passcode" className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-xl font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
                    
                    <div className="pt-4 space-y-3">
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-blue-900/20">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Establish Secure Connection'}
                        </button>
                        <button type="button" onClick={onCancel} className="w-full text-slate-500 hover:text-slate-400 font-bold text-xs uppercase tracking-widest transition-colors">Cancel Session</button>
                    </div>
                </form>
            </div>
        </div>
    );
};