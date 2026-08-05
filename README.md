# Pencatatan Iuran Warga

Aplikasi berbasis web untuk memudahkan pencatatan, pengelolaan, dan pelaporan iuran warga (Kas Bulanan). Aplikasi ini dirancang agar sederhana, interaktif, dan mudah digunakan oleh pengurus RT/RW dalam mengelola dana warga secara transparan dan efisien.

## Fitur Utama

- **Dashboard Ringkasan:** Menampilkan total pemasukan, saldo berjalan, serta tingkat partisipasi warga secara visual melalui grafik dan statistik ringkas.
- **Pencatatan per RT:** Tab terpisah untuk masing-masing RT (RT 01, RT 02, RT 03) untuk memudahkan pengelompokan data warga.
- **Manajemen Warga:** Tambah, edit, atau hapus data warga di setiap RT.
- **Pencatatan Cepat (Quick Action):** Tandai lunas, batalkan iuran, atau catat lebih bayar dengan cepat melalui antarmuka tabel interaktif.
- **Ekspor dan Impor Data:** Fitur untuk mengunduh laporan iuran atau memulihkan data melalui *Export/Import*.
- **Penyimpanan Cloud (Firebase):** Data iuran disimpan dan tersinkronisasi secara real-time.
- **Responsif dan Interaktif:** Antarmuka responsif yang dapat diakses baik melalui desktop maupun perangkat mobile dengan lancar, memanfaatkan animasi halus dari framer-motion.

## Teknologi yang Digunakan

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React (Ikon)
- **Animasi:** Framer Motion
- **Database:** Firebase Firestore
- **Chart:** Recharts (Visualisasi Data)
- **PDF Generation:** jsPDF, html2canvas

## Panduan Penggunaan Lokal

1. **Instalasi Dependensi**
   ```bash
   npm install
   ```

2. **Pengaturan Environment**
   Buat file `.env` berdasarkan template `.env.example` dan masukkan konfigurasi Firebase Anda.
   ```bash
   cp .env.example .env
   ```

3. **Menjalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di port 3000 (secara default pada environment ini).

4. **Build untuk Produksi**
   ```bash
   npm run build
   ```
   Output build akan berada di direktori `dist`.

## Struktur Proyek

- `src/`
  - `components/`: Komponen UI yang modular seperti Tab RT, Dashboard, Export/Import.
  - `lib/`: Fungsi utilitas, koneksi Firebase, dan tipe data global.
  - `App.tsx`: Komponen utama aplikasi.
  - `index.css`: Pengaturan gaya global berbasis Tailwind.

## Lisensi

Aplikasi ini dikembangkan untuk keperluan pencatatan mandiri.
