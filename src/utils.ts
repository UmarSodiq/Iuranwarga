export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculatePaidCount(payments: Record<string, boolean>): number {
  return Object.values(payments).filter(Boolean).length;
}

export function calculateCitizenTotal(payments: Record<string, boolean>, monthlyFee: number, extraPayment: number = 0): number {
  return (calculatePaidCount(payments) * monthlyFee) + (extraPayment || 0);
}
