export interface Citizen {
  id: string;
  name: string;
  rt: '01' | '02' | '03';
  payments: Record<string, boolean>; // monthId -> isPaid
  extraPayment?: number; // Optional extra donation or overpayment
}

export interface RTConfig {
  id: '01' | '02' | '03';
  monthlyFee: number; // e.g. 20000 (Rp)
}

export interface MonthInfo {
  id: string;
  name: string;
  shortName: string;
  year: number;
}
