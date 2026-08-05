import { MonthInfo, Citizen, RTConfig } from './types';

export const MONTHS: MonthInfo[] = [
  { id: 'agt26', name: 'Agustus 2026', shortName: 'Agt I', year: 2026 },
  { id: 'sep26', name: 'September 2026', shortName: 'Sep', year: 2026 },
  { id: 'okt26', name: 'Oktober 2026', shortName: 'Okt', year: 2026 },
  { id: 'nov26', name: 'November 2026', shortName: 'Nov', year: 2026 },
  { id: 'des26', name: 'Desember 2026', shortName: 'Des', year: 2026 },
  { id: 'jan27', name: 'Januari 2027', shortName: 'Jan', year: 2027 },
  { id: 'feb27', name: 'Februari 2027', shortName: 'Feb', year: 2027 },
  { id: 'mar27', name: 'Maret 2027', shortName: 'Mar', year: 2027 },
  { id: 'apr27', name: 'April 2027', shortName: 'Apr', year: 2027 },
  { id: 'mei27', name: 'Mei 2027', shortName: 'Mei', year: 2027 },
  { id: 'jun27', name: 'Juni 2027', shortName: 'Jun', year: 2027 },
  { id: 'jul27', name: 'Juli 2027', shortName: 'Jul', year: 2027 },
  { id: 'agt27', name: 'Agustus 2027', shortName: 'Agt II', year: 2027 },
];

export const DEFAULT_RT_CONFIGS: RTConfig[] = [
  { id: '01', monthlyFee: 5000 }, // Rp 5.000 per month
  { id: '02', monthlyFee: 5000 }, // Rp 5.000 per month
  { id: '03', monthlyFee: 5000 }, // Rp 5.000 per month
];

export const DEFAULT_CITIZENS: Citizen[] = [
  // RT 01
  {
    id: '1-1',
    name: 'Ahmad Fauzi',
    rt: '01',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: false, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },
  {
    id: '1-2',
    name: 'Sri Wahyuni',
    rt: '01',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: true, apr27: true, mei27: true,
      jun27: false, jul27: false, agt27: false
    }
  },
  {
    id: '1-3',
    name: 'Bambang Hermawan',
    rt: '01',
    payments: {
      agt26: true, sep26: false, okt26: false, nov26: false, des26: false,
      jan27: false, feb27: false, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },
  {
    id: '1-4',
    name: 'Hendra Wijaya',
    rt: '01',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: true, apr27: true, mei27: true,
      jun27: true, jul27: true, agt27: true
    }
  },
  {
    id: '1-5',
    name: 'Dian Lestari',
    rt: '01',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: false, des26: false,
      jan27: false, feb27: false, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },

  // RT 02
  {
    id: '2-1',
    name: 'Adi Nugroho',
    rt: '02',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },
  {
    id: '2-2',
    name: 'Rina Kartika',
    rt: '02',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: true, apr27: true, mei27: true,
      jun27: true, jul27: false, agt27: false
    }
  },
  {
    id: '2-3',
    name: 'Agus Salim',
    rt: '02',
    payments: {
      agt26: true, sep26: true, okt26: false, nov26: false, des26: false,
      jan27: false, feb27: false, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },
  {
    id: '2-4',
    name: 'Eko Prasetyo',
    rt: '02',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: true, apr27: true, mei27: true,
      jun27: true, jul27: true, agt27: true
    }
  },
  {
    id: '2-5',
    name: 'Dewi Sartika',
    rt: '02',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: false,
      jan27: false, feb27: false, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },

  // RT 03
  {
    id: '3-1',
    name: 'Fitriani',
    rt: '03',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: true, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },
  {
    id: '3-2',
    name: 'Surya Saputra',
    rt: '03',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: true, apr27: true, mei27: true,
      jun27: true, jul27: true, agt27: false
    }
  },
  {
    id: '3-3',
    name: 'Taufik Hidayat',
    rt: '03',
    payments: {
      agt26: true, sep26: false, okt26: false, nov26: false, des26: false,
      jan27: false, feb27: false, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  },
  {
    id: '3-4',
    name: 'Megawati',
    rt: '03',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: true, feb27: true, mar27: true, apr27: true, mei27: true,
      jun27: true, jul27: true, agt27: true
    }
  },
  {
    id: '3-5',
    name: 'Rudi Hartono',
    rt: '03',
    payments: {
      agt26: true, sep26: true, okt26: true, nov26: true, des26: true,
      jan27: false, feb27: false, mar27: false, apr27: false, mei27: false,
      jun27: false, jul27: false, agt27: false
    }
  }
];
