import React from 'react';
import { Citizen, RTConfig } from '../types';
import { MONTHS } from '../constants';
import { formatRupiah, calculateCitizenTotal, calculatePaidCount } from '../utils';
import { generatePDFReport } from '../lib/pdfExport';
import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  Award,
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface SummaryTabProps {
  citizens: Citizen[];
  rtConfigs: RTConfig[];
}

export default function SummaryTab({ citizens, rtConfigs }: SummaryTabProps) {
  // Get fees
  const rt01Fee = rtConfigs.find((c) => c.id === '01')?.monthlyFee || 0;
  const rt02Fee = rtConfigs.find((c) => c.id === '02')?.monthlyFee || 0;
  const rt03Fee = rtConfigs.find((c) => c.id === '03')?.monthlyFee || 0;

  // Calculate statistics per RT
  const getRTStats = (rtId: '01' | '02' | '03', fee: number) => {
    const rtCitizens = citizens.filter((c) => c.rt === rtId);
    const count = rtCitizens.length;
    const collected = rtCitizens.reduce(
      (sum, c) => sum + calculateCitizenTotal(c.payments, fee, c.extraPayment),
      0
    );
    const totalPossible = count * MONTHS.length;
    const totalPaidMonths = rtCitizens.reduce(
      (sum, c) => sum + calculatePaidCount(c.payments),
      0
    );
    const completionRate = totalPossible > 0 ? Math.round((totalPaidMonths / totalPossible) * 100) : 0;
    
    return { count, collected, completionRate, totalPaidMonths, totalPossible };
  };

  const rt01Stats = getRTStats('01', rt01Fee);
  const rt02Stats = getRTStats('02', rt02Fee);
  const rt03Stats = getRTStats('03', rt03Fee);

  // Grand totals
  const grandTotalCitizens = citizens.length;
  const grandTotalCollected = rt01Stats.collected + rt02Stats.collected + rt03Stats.collected;
  
  const grandTotalPossiblePayments = rt01Stats.totalPossible + rt02Stats.totalPossible + rt03Stats.totalPossible;
  const grandActualPayments = rt01Stats.totalPaidMonths + rt02Stats.totalPaidMonths + rt03Stats.totalPaidMonths;
  const grandCompletionRate = grandTotalPossiblePayments > 0 
    ? Math.round((grandActualPayments / grandTotalPossiblePayments) * 100) 
    : 0;

  // Chart data generation
  const chartData = MONTHS.map((month) => {
    const rt01Amount = citizens
      .filter((c) => c.rt === '01')
      .reduce((sum, c) => sum + (c.payments[month.id] ? rt01Fee : 0), 0);

    const rt02Amount = citizens
      .filter((c) => c.rt === '02')
      .reduce((sum, c) => sum + (c.payments[month.id] ? rt02Fee : 0), 0);

    const rt03Amount = citizens
      .filter((c) => c.rt === '03')
      .reduce((sum, c) => sum + (c.payments[month.id] ? rt03Fee : 0), 0);

    return {
      month: month.shortName,
      fullName: month.name,
      'RT 01': rt01Amount,
      'RT 02': rt02Amount,
      'RT 03': rt03Amount,
      Total: rt01Amount + rt02Amount + rt03Amount,
    };
  });

  // Citizen delinquency list (those who have outstanding bills)
  const citizensWithDebts = citizens
    .map((c) => {
      const fee = c.rt === '01' ? rt01Fee : c.rt === '02' ? rt02Fee : rt03Fee;
      const paidMonths = calculatePaidCount(c.payments);
      const unpaidMonths = MONTHS.length - paidMonths;
      const debtAmount = unpaidMonths * fee;

      return {
        ...c,
        paidMonths,
        unpaidMonths,
        debtAmount,
      };
    })
    .filter((c) => c.unpaidMonths > 0)
    .sort((a, b) => b.unpaidMonths - a.unpaidMonths) // Sort by most unpaid months
    .slice(0, 5); // Take top 5

  // Customize tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-md border border-slate-800 text-xs space-y-1">
          <p className="font-semibold text-slate-300 mb-1">{payload[0].payload.fullName}</p>
          <p className="text-indigo-300">RT 01: {formatRupiah(payload[0].payload['RT 01'])}</p>
          <p className="text-emerald-300">RT 02: {formatRupiah(payload[0].payload['RT 02'])}</p>
          <p className="text-amber-300">RT 03: {formatRupiah(payload[0].payload['RT 03'])}</p>
          <div className="border-t border-slate-700/50 mt-1.5 pt-1.5 flex justify-between font-bold text-white">
            <span>Total:</span>
            <span>{formatRupiah(payload[0].payload.Total)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & PDF Report Action */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Ringkasan & Rekapitulasi Kas</span>
          </h2>
          <p className="text-xs text-slate-500">
            Laporan lengkap akumulasi iuran warga RT 01, RT 02, dan RT 03 per bulan.
          </p>
        </div>
        <button
          onClick={() => generatePDFReport(citizens, rtConfigs)}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600/90 hover:bg-indigo-600 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 backdrop-blur-md cursor-pointer border border-indigo-400/30 shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Unduh Laporan (PDF)</span>
        </button>
      </div>

      {/* Grand Totals Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div id="summary-grand-total" className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-2xl p-6 shadow-xl shadow-indigo-600/30 border border-indigo-400/40 flex flex-col justify-between relative overflow-hidden group backdrop-blur-xl">
          {/* Decorative glass glow effect */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-400/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-purple-400/25 rounded-full blur-2xl" />
          
          <div className="flex justify-end items-start relative z-10">
            <span className="text-[10px] bg-white/20 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-md border border-white/30 shadow-xs">
              Akumulasi
            </span>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-xs text-indigo-100/90 font-medium tracking-wide">Grand Total Iuran Terkumpul</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 drop-shadow-xs">
              {formatRupiah(grandTotalCollected)}
            </h3>
            <p className="text-[11px] text-indigo-100 mt-2 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>Dari total 3 RT terdaftar</span>
            </p>
          </div>
        </div>

        {/* RT 01 */}
        <div id="summary-rt01" className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl backdrop-blur-md border border-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-semibold uppercase">RT 01</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-medium">Iuran Terkumpul RT 01</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-0.5">
              {formatRupiah(rt01Stats.collected)}
            </h4>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {rt01Stats.completionRate}%
              </span>
              <span>Lunas ({rt01Stats.count} Warga)</span>
            </div>
          </div>
        </div>

        {/* RT 02 */}
        <div id="summary-rt02" className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl backdrop-blur-md border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-semibold uppercase">RT 02</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-medium">Iuran Terkumpul RT 02</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-0.5">
              {formatRupiah(rt02Stats.collected)}
            </h4>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {rt02Stats.completionRate}%
              </span>
              <span>Lunas ({rt02Stats.count} Warga)</span>
            </div>
          </div>
        </div>

        {/* RT 03 */}
        <div id="summary-rt03" className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl backdrop-blur-md border border-amber-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-semibold uppercase">RT 03</span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-medium">Iuran Terkumpul RT 03</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-0.5">
              {formatRupiah(rt03Stats.collected)}
            </h4>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {rt03Stats.completionRate}%
              </span>
              <span>Lunas ({rt03Stats.count} Warga)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 glass-card p-4 rounded-2xl text-sm">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-slate-600">Total Warga Gabungan:</span>
          <span className="font-bold text-slate-900">{grandTotalCitizens} Orang</span>
        </div>
        <div className="flex items-center gap-2 justify-center border-y sm:border-y-0 sm:border-x border-slate-300/40 py-2 sm:py-0">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-slate-600">Periode Pencatatan:</span>
          <span className="font-bold text-slate-900">13 Bulan (Agustus - Agustus)</span>
        </div>
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          <Award className="w-4 h-4 text-slate-500" />
          <span className="text-slate-600">Persentase Lunas Nasional:</span>
          <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-xs border border-emerald-500/20">
            {grandCompletionRate}%
          </span>
        </div>
      </div>

      {/* Recharts Stacked Bar Chart */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div>
          <h4 className="text-base font-semibold text-slate-900">Statistik Grafik Penerimaan Iuran Warga</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontribusi bulanan terkumpul dari RT 01, RT 02, dan RT 03 per bulan.
          </p>
        </div>
        <div className="h-[300px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#64748b" 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `Rp ${value / 1000}k`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.4)' }} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
              />
              <Bar dataKey="RT 01" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="RT 02" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="RT 03" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split Section: Delinquency vs RT Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Outstanding Reminder List */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-7 space-y-4">
          <div>
            <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Daftar Tunggakan Terbanyak</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Warga yang memiliki jumlah bulan belum membayar paling banyak. Segera hubungi untuk penagihan.
            </p>
          </div>

          <div className="divide-y divide-slate-200/50">
            {citizensWithDebts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Semua warga telah melunasi seluruh iuran bulanan! 🎉
              </div>
            ) : (
              citizensWithDebts.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4 text-sm first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-600 text-xs backdrop-blur-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-800">{c.name}</h5>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-indigo-600 bg-indigo-500/10 px-1.5 py-0.5 rounded-md text-[10px] border border-indigo-500/20">
                          RT {c.rt}
                        </span>
                        <span>•</span>
                        <span>Sisa {c.paidMonths} bulan lunas</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-rose-600">{formatRupiah(c.debtAmount)}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {c.unpaidMonths} Bulan Menunggak
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RT Performance Summary cards */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-5 space-y-4">
          <div>
            <h4 className="text-base font-semibold text-slate-900">Analisis Kinerja Keuangan RT</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Rasio kesuksesan penarikan iuran di masing-masing RT.
            </p>
          </div>

          <div className="space-y-4">
            {/* RT 01 progress item */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-600">RT 01 (Tarif: {formatRupiah(rt01Fee)}/bln)</span>
                <span className="text-slate-700">{rt01Stats.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: `${rt01Stats.completionRate}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{rt01Stats.count} Warga terdaftar</span>
                <span>Terkumpul: {formatRupiah(rt01Stats.collected)}</span>
              </div>
            </div>

            {/* RT 02 progress item */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-600">RT 02 (Tarif: {formatRupiah(rt02Fee)}/bln)</span>
                <span className="text-slate-700">{rt02Stats.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: `${rt02Stats.completionRate}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{rt02Stats.count} Warga terdaftar</span>
                <span>Terkumpul: {formatRupiah(rt02Stats.collected)}</span>
              </div>
            </div>

            {/* RT 03 progress item */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-600">RT 03 (Tarif: {formatRupiah(rt03Fee)}/bln)</span>
                <span className="text-slate-700">{rt03Stats.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: `${rt03Stats.completionRate}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{rt03Stats.count} Warga terdaftar</span>
                <span>Terkumpul: {formatRupiah(rt03Stats.collected)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
