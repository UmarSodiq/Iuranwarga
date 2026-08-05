import React, { useState } from 'react';
import { Citizen } from '../types';
import { MONTHS } from '../constants';
import { formatRupiah, calculateCitizenTotal, calculatePaidCount } from '../utils';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Check, 
  X, 
  RotateCcw, 
  Coins, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Table,
  LayoutGrid,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RTTabProps {
  rtId: '01' | '02' | '03';
  citizens: Citizen[];
  monthlyFee: number;
  onUpdatePayment: (citizenId: string, monthId: string, isPaid: boolean) => void;
  onAddCitizen: (name: string, rt: '01' | '02' | '03') => void;
  onDeleteCitizen: (id: string) => void;
  onEditCitizenName: (id: string, newName: string) => void;
  onUpdateFee: (rt: '01' | '02' | '03', newFee: number) => void;
  onBulkUpdatePayments: (citizenId: string, isPaid: boolean) => void;
  onUpdateExtraPayment: (citizenId: string, amount: number) => void;
}

export default function RTTab({
  rtId,
  citizens,
  monthlyFee,
  onUpdatePayment,
  onAddCitizen,
  onDeleteCitizen,
  onEditCitizenName,
  onUpdateFee,
  onBulkUpdatePayments,
  onUpdateExtraPayment,
}: RTTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newCitizenName, setNewCitizenName] = useState('');
  const [editingCitizenId, setEditingCitizenId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [tempFee, setTempFee] = useState(monthlyFee.toString());
  
  const [editingExtraPaymentId, setEditingExtraPaymentId] = useState<string | null>(null);
  const [tempExtraPayment, setTempExtraPayment] = useState('');
  const [citizenToDelete, setCitizenToDelete] = useState<Citizen | null>(null);

  // Mobile View Mode: 'card' (Optimized for Mobile Phones) or 'matrix' (Full Table Matrix)
  const [viewMode, setViewMode] = useState<'card' | 'matrix'>('card');
  // Status Filter: 'all' | 'unpaid' | 'paid'
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  // Expanded card state for mobile card view
  const [expandedCitizenIds, setExpandedCitizenIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCitizenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle adding new citizen
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitizenName.trim()) return;
    onAddCitizen(newCitizenName.trim(), rtId);
    setNewCitizenName('');
  };

  // Start editing citizen name
  const startEditing = (citizen: Citizen) => {
    setEditingCitizenId(citizen.id);
    setEditingName(citizen.name);
  };

  // Save citizen name
  const saveName = (id: string) => {
    if (!editingName.trim()) return;
    onEditCitizenName(id, editingName.trim());
    setEditingCitizenId(null);
  };

  // Start editing extra payment
  const startEditingExtraPayment = (citizen: Citizen) => {
    setEditingExtraPaymentId(citizen.id);
    setTempExtraPayment((citizen.extraPayment || 0).toString());
  };

  // Save extra payment
  const saveExtraPayment = (id: string) => {
    const parsedAmount = parseInt(tempExtraPayment.replace(/\D/g, ''), 10);
    onUpdateExtraPayment(id, isNaN(parsedAmount) ? 0 : parsedAmount);
    setEditingExtraPaymentId(null);
  };

  // Save monthly fee
  const saveFeeSetting = () => {
    const parsedFee = parseInt(tempFee.replace(/\D/g, ''), 10);
    if (!isNaN(parsedFee) && parsedFee >= 0) {
      onUpdateFee(rtId, parsedFee);
      setIsEditingFee(false);
    }
  };

  // Filter citizens based on search term and status filter
  const filteredCitizens = citizens.filter((citizen) => {
    const matchesSearch = citizen.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const paidCount = calculatePaidCount(citizen.payments);
    const isFullyPaid = paidCount === MONTHS.length;

    if (statusFilter === 'unpaid') return !isFullyPaid;
    if (statusFilter === 'paid') return isFullyPaid;
    return true;
  });

  // RT Specific stats
  const totalCitizens = citizens.length;
  const totalCollected = citizens.reduce(
    (sum, c) => sum + calculateCitizenTotal(c.payments, monthlyFee, c.extraPayment),
    0
  );
  const maxPossiblePayments = totalCitizens * MONTHS.length;
  const actualPaymentsCount = citizens.reduce(
    (sum, c) => sum + calculatePaidCount(c.payments),
    0
  );
  const paymentPercentage = maxPossiblePayments > 0 
    ? Math.round((actualPaymentsCount / maxPossiblePayments) * 100) 
    : 0;

  return (
    <div className="space-y-5">
      {/* Metrics Header Dashboard for this RT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Citizens Card */}
        <div id={`rt-card-citizens-${rtId}`} className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl backdrop-blur-md border border-indigo-500/20 shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Terdaftar</p>
            <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{totalCitizens} Warga</h4>
          </div>
        </div>

        {/* Total Dues Collected Card */}
        <div id={`rt-card-collected-${rtId}`} className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl backdrop-blur-md border border-emerald-500/20 shrink-0">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Iuran Terkumpul RT {rtId}</p>
            <h4 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
              {formatRupiah(totalCollected)}
            </h4>
          </div>
        </div>

        {/* Payment Progress Percentage Card */}
        <div id={`rt-card-progress-${rtId}`} className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl backdrop-blur-md border border-amber-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium">Tingkat Pelunasan</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900">{paymentPercentage}%</h4>
              <span className="text-[11px] text-slate-500 truncate">
                ({actualPaymentsCount}/{maxPossiblePayments} bulan)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200/60 h-2 rounded-full mt-2 overflow-hidden backdrop-blur-sm p-0.5">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-xs" 
                style={{ width: `${paymentPercentage}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: View Toggle, Search, Add Citizen, and Monthly Fee Config */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Top Control Toolbar: View Mode & Status Filter */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center border-b border-slate-200/50 pb-3.5">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar p-1 bg-slate-200/50 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({citizens.length})
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'unpaid'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Belum Lunas</span>
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lunas</span>
            </button>
          </div>

          {/* View Mode Switcher (Kartu Mobile vs Tabel Matrix) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden xs:inline">Mode:</span>
            <div className="flex p-1 bg-slate-200/50 rounded-xl">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Kartu Ringkas (Cocok HP)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartu HP</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Matrix"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabel Matrix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Tariff Row */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama warga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/80 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Monthly Fee Configuration */}
          <div className="flex items-center justify-between sm:justify-start gap-2 text-sm bg-white/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 shadow-2xs">
            <span className="text-slate-600 font-medium">Tarif Bulanan:</span>
            {isEditingFee ? (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Rp</span>
                <input
                  type="text"
                  value={tempFee}
                  onChange={(e) => setTempFee(e.target.value.replace(/\D/g, ''))}
                  className="w-20 px-2 py-1 glass-input rounded-md focus:ring-1 focus:ring-indigo-500 outline-hidden font-semibold text-slate-800 text-sm"
                  autoFocus
                />
                <button
                  onClick={saveFeeSetting}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-md transition-colors cursor-pointer"
                  title="Simpan"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setTempFee(monthlyFee.toString());
                    setIsEditingFee(false);
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                  title="Batal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{formatRupiah(monthlyFee)}</span>
                <button
                  onClick={() => {
                    setTempFee(monthlyFee.toString());
                    setIsEditingFee(true);
                  }}
                  className="text-xs text-indigo-600 hover:underline hover:text-indigo-700 font-semibold cursor-pointer"
                >
                  Ubah
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Citizen Form */}
        <form onSubmit={handleAddSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah nama warga baru..."
            value={newCitizenName}
            onChange={(e) => setNewCitizenName(e.target.value)}
            className="flex-1 px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/80 transition-all text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!newCitizenName.trim()}
            className="px-4 py-2.5 bg-indigo-600/90 hover:bg-indigo-600 disabled:bg-indigo-300/50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 backdrop-blur-md cursor-pointer border border-indigo-400/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Tambah Warga</span>
            <span className="xs:hidden">Tambah</span>
          </button>
        </form>
      </div>

      {/* Content Area: Card View vs Matrix Table View */}
      {filteredCitizens.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 space-y-2">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h5 className="font-semibold text-slate-700 text-base">Tidak ada data warga</h5>
          <p className="text-xs text-slate-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Coba ubah kata kunci pencarian atau filter status Anda.' 
              : 'Silakan tambahkan warga baru terlebih dahulu.'}
          </p>
        </div>
      ) : viewMode === 'card' ? (
        /* MOBILE OPTIMIZED CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCitizens.map((citizen) => {
            const paidMonthsCount = calculatePaidCount(citizen.payments);
            const totalPaidAmount = calculateCitizenTotal(citizen.payments, monthlyFee, citizen.extraPayment);
            const isFullyPaid = paidMonthsCount === MONTHS.length;
            const isExpanded = expandedCitizenIds[citizen.id] ?? true;

            return (
              <div 
                key={citizen.id} 
                className={`glass-card rounded-2xl p-4 transition-all duration-200 border ${
                  isFullyPaid 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : 'border-slate-200/80'
                }`}
              >
                {/* Header Warga */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editingCitizenId === citizen.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm glass-input rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveName(citizen.id);
                          }}
                        />
                        <button
                          onClick={() => saveName(citizen.id)}
                          className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCitizenId(null)}
                          className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg hover:bg-rose-500/20 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base truncate">{citizen.name}</h4>
                        <button
                          onClick={() => startEditing(citizen)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md transition-all cursor-pointer shrink-0"
                          title="Edit Nama"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        isFullyPaid 
                          ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' 
                          : 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                      }`}>
                        {isFullyPaid ? 'LUNAS (13 Bulan)' : `${paidMonthsCount} / 13 Bulan`}
                      </span>
                      <span className="font-bold text-slate-800">
                        Total: {formatRupiah(totalPaidAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Quick Toggle All */}
                    {isFullyPaid ? (
                      <button
                        onClick={() => onBulkUpdatePayments(citizen.id, false)}
                        className="px-2.5 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-semibold rounded-xl transition-all cursor-pointer border border-amber-500/20 flex items-center gap-1"
                        title="Reset Semua Bulan"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onBulkUpdatePayments(citizen.id, true)}
                        className="px-2.5 py-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-semibold rounded-xl transition-all cursor-pointer border border-emerald-500/20 flex items-center gap-1"
                        title="Tandai Lunas Semua"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lunasi</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(citizen.id)}
                      className="p-1.5 bg-slate-200/50 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                      title={isExpanded ? 'Sembunyikan Bulan' : 'Tampilkan Bulan'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Month Checkboxes for Mobile Touch */}
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3.5 pt-3 border-t border-slate-200/50 space-y-3"
                  >
                    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 gap-1.5">
                      {MONTHS.map((month) => {
                        const isPaid = !!citizen.payments[month.id];
                        return (
                          <button
                            key={month.id}
                            onClick={() => onUpdatePayment(citizen.id, month.id, !isPaid)}
                            className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] ${
                              isPaid
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs shadow-emerald-500/30 scale-[0.98]'
                                : 'bg-white/60 hover:bg-white text-slate-700 border-slate-300/80 hover:border-indigo-400'
                            }`}
                          >
                            <span className="text-xs font-extrabold leading-none">{month.shortName}</span>
                            <span className={`text-[9px] mt-0.5 capitalize leading-none ${isPaid ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {month.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Extra Payment & Delete Row */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      {/* Lebih Bayar Input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium text-[11px]">Lebih Bayar:</span>
                        {editingExtraPaymentId === citizen.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempExtraPayment}
                              onChange={(e) => setTempExtraPayment(e.target.value.replace(/\D/g, ''))}
                              className="w-20 px-2 py-0.5 text-xs glass-input rounded-md font-semibold text-slate-800"
                              autoFocus
                            />
                            <button
                              onClick={() => saveExtraPayment(citizen.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingExtraPayment(citizen)}
                            className="font-semibold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md hover:bg-indigo-500/20 transition-all cursor-pointer border border-indigo-500/20 text-[11px]"
                          >
                            {citizen.extraPayment && citizen.extraPayment > 0 
                              ? formatRupiah(citizen.extraPayment) 
                              : '+ Edit Lebih Bayar'}
                          </button>
                        )}
                      </div>

                      {/* Delete Citizen */}
                      <button
                        onClick={() => setCitizenToDelete(citizen)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* FULL TABLE MATRIX VIEW */
        <div className="glass-table rounded-2xl border border-white/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto touch-scrolling">
            <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-[1000px]">
              <thead>
                <tr className="bg-slate-100/70 backdrop-blur-md border-b border-slate-200/60 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <th className="py-4 px-3 sm:px-5 sticky left-0 bg-slate-100/90 backdrop-blur-md z-10 w-[140px] sm:w-[180px] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                    Nama Warga
                  </th>
                  {MONTHS.map((month) => (
                    <th key={month.id} className="py-4 px-1 sm:px-2 text-center w-[48px] sm:w-[60px]">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-800 text-[10px] sm:text-xs">{month.shortName}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 capitalize normal-case mt-0.5 font-normal">
                          {month.name.split(' ')[0]}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="py-4 px-2 sm:px-4 text-right w-[90px] sm:w-[110px] font-bold text-slate-700">
                    Lebih Bayar
                  </th>
                  <th className="py-4 px-2 sm:px-4 text-right w-[100px] sm:w-[130px] font-bold text-slate-700">
                    Total Iuran
                  </th>
                  <th className="py-4 px-3 sm:px-5 text-center w-[120px] sm:w-[150px] font-bold text-slate-700">
                    Aksi Cepat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 text-xs sm:text-sm">
                {filteredCitizens.map((citizen) => {
                  const paidMonthsCount = calculatePaidCount(citizen.payments);
                  const totalPaidAmount = calculateCitizenTotal(citizen.payments, monthlyFee, citizen.extraPayment);
                  const isFullyPaid = paidMonthsCount === MONTHS.length;

                  return (
                    <tr
                      key={citizen.id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      {/* Name Column - Sticky */}
                      <td className="py-3 px-3 sm:px-5 sticky left-0 bg-white/90 backdrop-blur-md z-10 font-semibold text-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.03)] hover:bg-white transition-colors">
                        <div className="flex items-center justify-between group">
                          {editingCitizenId === citizen.id ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="w-full px-2 py-1 text-sm glass-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveName(citizen.id);
                                }}
                              />
                              <button
                                onClick={() => saveName(citizen.id)}
                                className="p-1 bg-emerald-500/10 text-emerald-600 rounded-md hover:bg-emerald-500/20 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingCitizenId(null)}
                                className="p-1 bg-rose-500/10 text-rose-600 rounded-md hover:bg-rose-500/20 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="truncate pr-1 text-slate-900 font-semibold" title={citizen.name}>
                                {citizen.name}
                              </span>
                              <button
                                onClick={() => startEditing(citizen)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md transition-all ml-1 cursor-pointer"
                                title="Edit Nama"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Month Checkboxes */}
                      {MONTHS.map((month) => {
                        const isPaid = !!citizen.payments[month.id];
                        return (
                          <td key={month.id} className="py-3 px-0.5 sm:px-1 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer p-1.5 rounded-md hover:bg-white/60 transition-colors">
                              <input
                                type="checkbox"
                                checked={isPaid}
                                onChange={(e) =>
                                  onUpdatePayment(citizen.id, month.id, e.target.checked)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all ${
                                  isPaid
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs shadow-emerald-500/30 scale-105'
                                    : 'bg-white/60 backdrop-blur-sm border-slate-300/80 text-transparent hover:border-indigo-400'
                                }`}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            </label>
                          </td>
                        );
                      })}

                      {/* Lebih Bayar Column */}
                      <td className="py-3 px-2 sm:px-4 text-right">
                        {editingExtraPaymentId === citizen.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="text"
                              value={tempExtraPayment}
                              onChange={(e) => setTempExtraPayment(e.target.value.replace(/\D/g, ''))}
                              className="w-16 px-1.5 py-0.5 text-xs glass-input rounded-md text-right font-semibold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveExtraPayment(citizen.id);
                              }}
                            />
                            <button
                              onClick={() => saveExtraPayment(citizen.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 group/extra">
                            <span className="text-xs font-semibold text-slate-700">
                              {citizen.extraPayment && citizen.extraPayment > 0 ? formatRupiah(citizen.extraPayment) : '-'}
                            </span>
                            <button
                              onClick={() => startEditingExtraPayment(citizen)}
                              className="opacity-0 group-hover/extra:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 rounded-md transition-all cursor-pointer"
                              title="Edit Lebih Bayar"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Total Dues Column */}
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <div className="flex flex-col items-end justify-center">
                          <span className={`font-semibold text-xs sm:text-sm ${isFullyPaid ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {formatRupiah(totalPaidAmount)}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                            {paidMonthsCount} / {MONTHS.length} Bulan
                          </span>
                        </div>
                      </td>

                      {/* Quick Actions (Bulk, Delete) */}
                      <td className="py-3 px-3 sm:px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isFullyPaid ? (
                            <button
                              onClick={() => onBulkUpdatePayments(citizen.id, false)}
                              className="px-2 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-amber-500/20"
                              title="Reset semua bulan menjadi belum lunas"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onBulkUpdatePayments(citizen.id, true)}
                              className="px-2 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-emerald-500/20"
                              title="Tandai semua bulan sudah lunas"
                            >
                              <Check className="w-3 h-3" />
                              <span>Lunas</span>
                            </button>
                          )}

                          <button
                            onClick={() => setCitizenToDelete(citizen)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Warga"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {citizenToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setCitizenToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-rose-500/20 space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl shrink-0 border border-rose-500/20">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hapus Data Warga?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Apakah Anda yakin ingin menghapus warga <span className="font-semibold text-slate-800">"{citizenToDelete.name}"</span> dari RT {rtId}? Seluruh data iuran warga ini akan dihapus.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setCitizenToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteCitizen(citizenToDelete.id);
                    setCitizenToDelete(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
