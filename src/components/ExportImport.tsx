import React, { useRef, useState } from 'react';
import { Citizen, RTConfig } from '../types';
import { Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ExportImportProps {
  citizens: Citizen[];
  rtConfigs: RTConfig[];
  onImportData: (citizens: Citizen[], rtConfigs: RTConfig[]) => void;
  onResetToDemo: () => void;
  onResetToEmpty: () => void;
}

export default function ExportImport({
  citizens,
  rtConfigs,
  onImportData,
  onResetToDemo,
  onResetToEmpty,
}: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmResetDemo, setShowConfirmResetDemo] = useState(false);
  const [showConfirmResetEmpty, setShowConfirmResetEmpty] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Export as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify({ citizens, rtConfigs }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `backup-iuran-rt-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showStatus('success', 'Backup data berhasil diunduh!');
  };

  // Trigger File Input Click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle Import JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];

    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target?.result as string);
        if (parsedData && Array.isArray(parsedData.citizens) && Array.isArray(parsedData.rtConfigs)) {
          // Robust verification of imported elements
          onImportData(parsedData.citizens, parsedData.rtConfigs);
          showStatus('success', 'Restorasi data backup berhasil dilakukan!');
        } else {
          showStatus('error', 'Format file backup tidak valid. Pastikan file JSON hasil ekspor dari aplikasi ini.');
        }
      } catch (err) {
        showStatus('error', 'Gagal membaca file backup. Pastikan file adalah format JSON yang benar.');
      }
    };
    fileReader.readAsText(file);
    // Reset file input so same file can be imported again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div>
        <h4 className="text-base font-semibold text-slate-900">Pencadangan & Pengaturan Database</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Simpan iuran warga Anda secara aman dengan mengekspor data ke komputer Anda atau mereset ulang database.
        </p>
      </div>

      {/* Action triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="glass-card glass-card-hover p-4.5 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <h5 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Ekspor Data (Backup)</span>
            </h5>
            <p className="text-xs text-slate-500 mt-1">
              Unduh seluruh daftar warga dan status pembayaran iuran saat ini ke dalam satu file JSON sebagai cadangan.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-2.5 bg-indigo-600/90 hover:bg-indigo-600 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 backdrop-blur-md border border-indigo-400/30"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Backup JSON</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="glass-card glass-card-hover p-4.5 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <h5 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Impor Data (Restore)</span>
            </h5>
            <p className="text-xs text-slate-500 mt-1">
              Unggah file backup JSON yang telah Anda ekspor sebelumnya untuk mengembalikan atau menimpa database aktif.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={triggerFileInput}
            className="w-full py-2.5 bg-emerald-600/90 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 backdrop-blur-md border border-emerald-400/30"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pilih File Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Reset Options */}
      <div className="border-t border-slate-200/50 pt-6 space-y-4">
        <h5 className="font-semibold text-slate-800 text-sm">Zona Berbahaya</h5>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Reset Demo button */}
          <div className="flex-1">
            {showConfirmResetDemo ? (
              <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 p-3 rounded-xl space-y-2 text-xs">
                <p className="font-semibold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  <span>Konfirmasi Isi Data Demo?</span>
                </p>
                <p className="text-amber-700">Tindakan ini akan menghapus data saat ini dan mengisi kembali 15 data contoh warga bawaan.</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowConfirmResetDemo(false)}
                    className="px-2.5 py-1 glass-card hover:bg-white text-slate-700 font-semibold rounded-md cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onResetToDemo();
                      setShowConfirmResetDemo(false);
                      showStatus('success', 'Berhasil memuat ulang data contoh!');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-md font-semibold hover:bg-amber-700 cursor-pointer text-xs shadow-xs"
                  >
                    Ya, Isi Demo
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowConfirmResetDemo(true);
                  setShowConfirmResetEmpty(false);
                }}
                className="w-full py-2.5 glass-card hover:bg-amber-500/10 hover:border-amber-400/40 text-slate-700 hover:text-amber-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Muat Ulang Data Contoh (Demo)</span>
              </button>
            )}
          </div>

          {/* Reset Empty button */}
          <div className="flex-1">
            {showConfirmResetEmpty ? (
              <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/30 p-3 rounded-xl space-y-2 text-xs">
                <p className="font-semibold text-rose-800 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  <span>Konfirmasi Kosongkan Database?</span>
                </p>
                <p className="text-rose-700">PERINGATAN: Seluruh warga terdaftar dan riwayat bayar akan dihapus permanen. Tidak bisa dibatalkan.</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowConfirmResetEmpty(false)}
                    className="px-2.5 py-1 glass-card hover:bg-white text-slate-700 font-semibold rounded-md cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onResetToEmpty();
                      setShowConfirmResetEmpty(false);
                      showStatus('success', 'Database berhasil dibersihkan total!');
                    }}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700 cursor-pointer text-xs shadow-xs"
                  >
                    Ya, Hapus Semua
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowConfirmResetEmpty(true);
                  setShowConfirmResetDemo(false);
                }}
                className="w-full py-2.5 glass-card hover:bg-rose-500/10 hover:border-rose-400/40 text-slate-700 hover:text-rose-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                <span>Kosongkan Seluruh Database</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Alert Messages */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 shadow-md backdrop-blur-md text-xs ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-900'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-900'
        }`}>
          <CheckCircle2 className={`w-4 h-4 ${statusMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
          <span className="flex-1 font-semibold">{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
