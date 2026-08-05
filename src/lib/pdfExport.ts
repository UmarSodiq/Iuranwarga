import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Citizen, RTConfig } from '../types';
import { MONTHS } from '../constants';
import { calculateCitizenTotal, formatRupiah } from '../utils';

// Helper to get fee for RT
const getFeeForRT = (rtId: string, rtConfigs: RTConfig[]) => {
  return rtConfigs.find(c => c.id === rtId)?.monthlyFee || 0;
};

export const generatePDFReport = (citizens: Citizen[], rtConfigs: RTConfig[]) => {
  // Create a new landscape A4 PDF
  const doc = new jsPDF('landscape', 'pt', 'a4');
  
  // Set fonts and sizes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Laporan Rekapitulasi Iuran Warga', 40, 40);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Tanggal Cetak: ${dateStr}`, 40, 55);

  // Summary Metrics
  const totalCitizens = citizens.length;
  const totalCollected = citizens.reduce((sum, c) => sum + calculateCitizenTotal(c.payments, getFeeForRT(c.rt, rtConfigs), c.extraPayment), 0);
  
  doc.text(`Total Warga: ${totalCitizens}`, 40, 75);
  doc.text(`Total Terkumpul: ${formatRupiah(totalCollected)}`, 200, 75);

  // Prepare table data
  const head = [
    ['No', 'Nama', 'RT', ...MONTHS.map(m => m.shortName), 'Lebih Bayar', 'Total']
  ];

  const sortedCitizens = [...citizens].sort((a, b) => {
    if (a.rt !== b.rt) return a.rt.localeCompare(b.rt);
    return a.name.localeCompare(b.name);
  });

  const body = sortedCitizens.map((c, index) => {
    const fee = getFeeForRT(c.rt, rtConfigs);
    const total = calculateCitizenTotal(c.payments, fee, c.extraPayment);
    const extraPayment = c.extraPayment ? formatRupiah(c.extraPayment) : '-';
    
    return [
      (index + 1).toString(),
      c.name,
      `RT ${c.rt}`,
      ...MONTHS.map(m => c.payments[m.id] ? 'Lunas' : '-'),
      extraPayment,
      formatRupiah(total)
    ];
  });

  // Render Table
  autoTable(doc, {
    startY: 90,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' }, // No
      1: { cellWidth: 80 }, // Nama
      2: { cellWidth: 35, halign: 'center' }, // RT
      // month columns will be auto-sized, but let's give them centered alignment
      ...Object.fromEntries(MONTHS.map((_, i) => [i + 3, { halign: 'center' }])),
      // Lebih Bayar
      [MONTHS.length + 3]: { halign: 'right' },
      // Total
      [MONTHS.length + 4]: { halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    },
    styles: {
      cellPadding: 3,
    },
    didDrawPage: (data: any) => {
      // Add footer
      const str = 'Halaman ' + (doc.internal as any).getNumberOfPages();
      doc.setFontSize(8);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 20);
    }
  });

  // Save the PDF
  doc.save(`Laporan_Iuran_${dateStr.replace(/ /g, '_')}.pdf`);
};
