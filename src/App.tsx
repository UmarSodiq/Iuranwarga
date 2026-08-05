import React, { useState, useEffect } from 'react';
import { Citizen, RTConfig } from './types';
import { DEFAULT_CITIZENS, DEFAULT_RT_CONFIGS } from './constants';
import RTTab from './components/RTTab';
import SummaryTab from './components/SummaryTab';
import ExportImport from './components/ExportImport';
import {
  Building2,
  LayoutDashboard,
  Settings,
  Coins,
  ShieldCheck,
  RefreshCw,
  Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  // --- STATE INITIALIZATION ---
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [rtConfigs, setRtConfigs] = useState<RTConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'01' | '02' | '03' | 'summary' | 'settings'>('summary');
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('syncing');

  // Load and Sync from Firestore
  useEffect(() => {
    setSyncStatus('syncing');
    
    const unsubscribeCitizens = onSnapshot(collection(db, 'citizens'), (snapshot) => {
      const citizensData = snapshot.docs.map(doc => doc.data() as Citizen);
      setCitizens(citizensData);
      setSyncStatus('synced');
    }, (error) => {
      console.error("Error syncing citizens: ", error);
      setSyncStatus('error');
    });

    const unsubscribeConfigs = onSnapshot(collection(db, 'rtConfigs'), (snapshot) => {
      const configsData = snapshot.docs.map(doc => doc.data() as RTConfig);
      setRtConfigs(configsData);
    }, (error) => {
      console.error("Error syncing configs: ", error);
      setSyncStatus('error');
    });

    // Check if empty on first load to seed data (timeout to let snapshot arrive first)
    const seedCheckTimeout = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    return () => {
      unsubscribeCitizens();
      unsubscribeConfigs();
      clearTimeout(seedCheckTimeout);
    };
  }, []);

  // Seed default data if database is empty on initial load
  useEffect(() => {
    if (isLoaded && citizens.length === 0 && rtConfigs.length === 0) {
      handleResetToDemo();
    }
  }, [isLoaded]);

  // --- ACTIONS HANDLERS ---

  // Update a single payment cell
  const handleUpdatePayment = async (citizenId: string, monthId: string, isPaid: boolean) => {
    try {
      setSyncStatus('syncing');
      const citizen = citizens.find(c => c.id === citizenId);
      if (!citizen) return;
      
      const newPayments = {
        ...citizen.payments,
        [monthId]: isPaid,
      };
      
      await updateDoc(doc(db, 'citizens', citizenId), {
        payments: newPayments
      });
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error updating payment: ", e);
      setSyncStatus('error');
    }
  };

  // Add new citizen
  const handleAddCitizen = async (name: string, rt: '01' | '02' | '03') => {
    try {
      setSyncStatus('syncing');
      const newCitizen: Citizen = {
        id: `${rt}-${Date.now()}`,
        name,
        rt,
        payments: {}, // All false by default
      };
      await setDoc(doc(db, 'citizens', newCitizen.id), newCitizen);
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error adding citizen: ", e);
      setSyncStatus('error');
    }
  };

  // Delete citizen
  const handleDeleteCitizen = async (id: string) => {
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'citizens', id));
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error deleting citizen: ", e);
      setSyncStatus('error');
    }
  };

  // Edit citizen name
  const handleEditCitizenName = async (id: string, newName: string) => {
    try {
      setSyncStatus('syncing');
      await updateDoc(doc(db, 'citizens', id), {
        name: newName
      });
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error updating name: ", e);
      setSyncStatus('error');
    }
  };

  // Update extra payment
  const handleUpdateExtraPayment = async (id: string, amount: number) => {
    try {
      setSyncStatus('syncing');
      await updateDoc(doc(db, 'citizens', id), {
        extraPayment: amount
      });
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error updating extra payment: ", e);
      setSyncStatus('error');
    }
  };

  // Update Monthly Fee per RT
  const handleUpdateFee = async (rtId: '01' | '02' | '03', newFee: number) => {
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'rtConfigs', rtId), {
        id: rtId,
        monthlyFee: newFee
      }, { merge: true });
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error updating fee: ", e);
      setSyncStatus('error');
    }
  };

  // Bulk set payments for a citizen (All Paid or All Unpaid)
  const handleBulkUpdatePayments = async (citizenId: string, isPaid: boolean) => {
    try {
      setSyncStatus('syncing');
      const updatedPayments: Record<string, boolean> = {};
      const monthKeys = [
        'agt26', 'sep26', 'okt26', 'nov26', 'des26', 'jan27',
        'feb27', 'mar27', 'apr27', 'mei27', 'jun27', 'jul27', 'agt27'
      ];
      monthKeys.forEach((k) => {
        updatedPayments[k] = isPaid;
      });
      
      await updateDoc(doc(db, 'citizens', citizenId), {
        payments: updatedPayments
      });
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error bulk updating payments: ", e);
      setSyncStatus('error');
    }
  };

  // Restore/Import backup
  const handleImportData = async (newCitizens: Citizen[], newConfigs: RTConfig[]) => {
    try {
      setSyncStatus('syncing');
      const batch = writeBatch(db);
      
      // Delete old data (best effort for current known data)
      citizens.forEach(c => {
        batch.delete(doc(db, 'citizens', c.id));
      });
      
      // Insert new data
      newCitizens.forEach(c => {
        batch.set(doc(db, 'citizens', c.id), c);
      });
      
      newConfigs.forEach(cfg => {
        batch.set(doc(db, 'rtConfigs', cfg.id), cfg);
      });
      
      await batch.commit();
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error importing data: ", e);
      setSyncStatus('error');
    }
  };

  // Reset database back to Demo values
  const handleResetToDemo = async () => {
    try {
      setSyncStatus('syncing');
      const batch = writeBatch(db);
      
      // Clear existing
      citizens.forEach(c => {
        batch.delete(doc(db, 'citizens', c.id));
      });
      
      // Add demo data
      DEFAULT_CITIZENS.forEach(c => {
        batch.set(doc(db, 'citizens', c.id), c);
      });
      
      DEFAULT_RT_CONFIGS.forEach(cfg => {
        batch.set(doc(db, 'rtConfigs', cfg.id), cfg);
      });
      
      await batch.commit();
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error resetting to demo: ", e);
      setSyncStatus('error');
    }
  };

  // Reset database to completely empty
  const handleResetToEmpty = async () => {
    try {
      setSyncStatus('syncing');
      const batch = writeBatch(db);
      
      citizens.forEach(c => {
        batch.delete(doc(db, 'citizens', c.id));
      });
      
      // Set default configs instead of full empty to avoid missing fees
      DEFAULT_RT_CONFIGS.forEach(cfg => {
        batch.set(doc(db, 'rtConfigs', cfg.id), cfg);
      });
      
      await batch.commit();
      setSyncStatus('synced');
    } catch (e) {
      console.error("Error emptying database: ", e);
      setSyncStatus('error');
    }
  };

  // Get current monthly fee for an RT
  const getRTFee = (rtId: '01' | '02' | '03'): number => {
    // If not found in sync yet, fallback to default 5000
    const config = rtConfigs.find((cfg) => cfg.id === rtId);
    return config ? config.monthlyFee : 5000;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Memuat & Sinkronisasi data iuran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 w-full overflow-x-hidden text-slate-800 font-sans antialiased pb-12 relative">
      {/* Background Glassmorphism Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-10 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl" />
      </div>

      {/* Top Main Hero Navbar - Glassmorphism Header */}
      <header className="glass-header sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-row items-center justify-between gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20 backdrop-blur-sm shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 text-left">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">Iuran Warga</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden xs:block">
                Sistem Pengelolaan Kas Bulanan RT 01, RT 02, RT 03
              </p>
            </div>
          </div>

          {/* Cloud Sync Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-md border shadow-2xs shrink-0 ${
            syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' :
            syncStatus === 'syncing' ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30' :
            'bg-rose-500/10 text-rose-700 border-rose-500/30'
          }`}>
            {syncStatus === 'synced' ? <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> : 
             syncStatus === 'syncing' ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-indigo-600" /> : 
             <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />}
            <span>
              {syncStatus === 'synced' ? 'Tersinkron' : 
               syncStatus === 'syncing' ? 'Menyinkronkan...' : 
               'Gagal'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Navigation & Tab Selectors */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 space-y-5 sm:space-y-6 relative z-10">
        <div className="flex overflow-x-auto hide-scrollbar touch-scrolling gap-2 sm:gap-2.5 p-1.5 glass-card rounded-2xl">
          {/* Summary Tab */}
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'summary'
                ? 'bg-slate-900/90 text-white shadow-md shadow-slate-900/20 backdrop-blur-md border border-slate-700/50'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Rangkuman</span>
          </button>

          {/* RT 01 Tab */}
          <button
            onClick={() => setActiveTab('01')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === '01'
                ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20 backdrop-blur-md border border-indigo-400/50'
                : 'text-slate-600 hover:bg-indigo-500/10 hover:text-indigo-600'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>RT 01</span>
          </button>

          {/* RT 02 Tab */}
          <button
            onClick={() => setActiveTab('02')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === '02'
                ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-600/20 backdrop-blur-md border border-emerald-400/50'
                : 'text-slate-600 hover:bg-emerald-500/10 hover:text-emerald-600'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>RT 02</span>
          </button>

          {/* RT 03 Tab */}
          <button
            onClick={() => setActiveTab('03')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === '03'
                ? 'bg-amber-500/90 text-white shadow-md shadow-amber-500/20 backdrop-blur-md border border-amber-300/50'
                : 'text-slate-600 hover:bg-amber-500/10 hover:text-amber-600'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>RT 03</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ml-auto cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-slate-700/90 text-white shadow-md shadow-slate-700/20 backdrop-blur-md border border-slate-500/50'
                : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Backup</span>
          </button>
        </div>

        {/* Tab Content Display - Animated transitions */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'summary' && (
                <SummaryTab
                  citizens={citizens}
                  rtConfigs={rtConfigs}
                />
              )}

              {activeTab === '01' && (
                <RTTab
                  rtId="01"
                  citizens={citizens.filter((c) => c.rt === '01')}
                  monthlyFee={getRTFee('01')}
                  onUpdatePayment={handleUpdatePayment}
                  onAddCitizen={handleAddCitizen}
                  onDeleteCitizen={handleDeleteCitizen}
                  onEditCitizenName={handleEditCitizenName}
                  onUpdateExtraPayment={handleUpdateExtraPayment}
                  onUpdateFee={handleUpdateFee}
                  onBulkUpdatePayments={handleBulkUpdatePayments}
                />
              )}

              {activeTab === '02' && (
                <RTTab
                  rtId="02"
                  citizens={citizens.filter((c) => c.rt === '02')}
                  monthlyFee={getRTFee('02')}
                  onUpdatePayment={handleUpdatePayment}
                  onAddCitizen={handleAddCitizen}
                  onDeleteCitizen={handleDeleteCitizen}
                  onEditCitizenName={handleEditCitizenName}
                  onUpdateExtraPayment={handleUpdateExtraPayment}
                  onUpdateFee={handleUpdateFee}
                  onBulkUpdatePayments={handleBulkUpdatePayments}
                />
              )}

              {activeTab === '03' && (
                <RTTab
                  rtId="03"
                  citizens={citizens.filter((c) => c.rt === '03')}
                  monthlyFee={getRTFee('03')}
                  onUpdatePayment={handleUpdatePayment}
                  onAddCitizen={handleAddCitizen}
                  onDeleteCitizen={handleDeleteCitizen}
                  onEditCitizenName={handleEditCitizenName}
                  onUpdateExtraPayment={handleUpdateExtraPayment}
                  onUpdateFee={handleUpdateFee}
                  onBulkUpdatePayments={handleBulkUpdatePayments}
                />
              )}

              {activeTab === 'settings' && (
                <ExportImport
                  citizens={citizens}
                  rtConfigs={rtConfigs}
                  onImportData={handleImportData}
                  onResetToDemo={handleResetToDemo}
                  onResetToEmpty={handleResetToEmpty}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="text-center text-xs text-slate-400 mt-16 max-w-7xl mx-auto px-4 border-t border-slate-200/55 pt-6">
        <p className="font-medium text-slate-500">Pencatatan Iuran Warga &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">Dibuat khusus untuk pengurus RT 01, RT 02, dan RT 03 dengan penyimpanan terenkripsi tersinkronisasi cloud.</p>
      </footer>
    </div>
  );
}
