export interface AuditMonth {
  month: string; // YYYY-MM
  search: number;
  lookup: number;
  total: number;
}

export interface AuditData {
  org: string;
  total: number;
  officers_n: number;
  date_min: string;
  date_max: string;
  type: { type: 'search' | 'lookup'; count: number }[];
  avg_devices: number;
  max_devices: number;
  avg_networks: number;
  max_networks: number;
  total_device_queries: number;
  months: AuditMonth[];
  officers: { name: string; count: number }[];
  cats: { cat: string; count: number }[];
  weekday: { day: string; count: number }[];
  hours: { hour: number; count: number }[];
  /** Source line shown in the footer. */
  source?: string;
}

export const UH_PD_AUDIT: AuditData = {
  org: 'University of Houston TX PD',
  total: 2980,
  officers_n: 18,
  date_min: 'Jun 02, 2024',
  date_max: 'Dec 11, 2025',
  type: [
    { type: 'search', count: 2459 },
    { type: 'lookup', count: 521 },
  ],
  avg_devices: 1846,
  max_devices: 11755,
  avg_networks: 83,
  max_networks: 706,
  total_device_queries: 5208684,
  months: [
    { month: '2024-06', search: 302, lookup: 40, total: 342 },
    { month: '2024-07', search: 318, lookup: 1, total: 319 },
    { month: '2024-08', search: 185, lookup: 1, total: 186 },
    { month: '2024-09', search: 185, lookup: 1, total: 186 },
    { month: '2024-10', search: 80, lookup: 3, total: 83 },
    { month: '2024-11', search: 49, lookup: 1, total: 50 },
    { month: '2024-12', search: 45, lookup: 2, total: 47 },
    { month: '2025-01', search: 169, lookup: 6, total: 175 },
    { month: '2025-02', search: 71, lookup: 13, total: 84 },
    { month: '2025-03', search: 422, lookup: 15, total: 437 },
    { month: '2025-04', search: 105, lookup: 5, total: 110 },
    { month: '2025-05', search: 157, lookup: 0, total: 157 },
    { month: '2025-06', search: 42, lookup: 0, total: 42 },
    { month: '2025-07', search: 151, lookup: 28, total: 179 },
    { month: '2025-08', search: 55, lookup: 151, total: 206 },
    { month: '2025-09', search: 32, lookup: 79, total: 111 },
    { month: '2025-10', search: 59, lookup: 97, total: 156 },
    { month: '2025-11', search: 22, lookup: 53, total: 75 },
    { month: '2025-12', search: 10, lookup: 25, total: 35 },
  ],
  officers: [
    { name: 'Aston Marvel', count: 1064 },
    { name: 'Erika Oviedo', count: 633 },
    { name: 'FEDERICO PEREZ', count: 253 },
    { name: 'Saul Llamas', count: 217 },
    { name: 'R Ali', count: 164 },
    { name: 'S Richie', count: 139 },
    { name: 'CHRISTOS STAVROPOULOS', count: 113 },
    { name: 'Leonard Ganther', count: 81 },
    { name: 'Ali Khan', count: 78 },
    { name: 'DAVID GONZALEZ', count: 65 },
    { name: 'abner duran', count: 55 },
    { name: 'Ronald Henderson', count: 50 },
    { name: 'Robert Latin-Baldon', count: 21 },
    { name: 'Dylan Hartman', count: 19 },
    { name: 'Claudia Lugo', count: 14 },
    { name: 'Emily Emerick', count: 12 },
    { name: 'Broderick Chatman', count: 1 },
    { name: 'Anita Couch', count: 1 },
  ],
  cats: [
    { cat: 'General investigation / info', count: 1438 },
    { cat: 'Theft / stolen property', count: 919 },
    { cat: 'Case number / reference', count: 278 },
    { cat: 'Suspicious / wanted', count: 152 },
    { cat: 'Other / unspecified', count: 90 },
    { cat: 'Traffic / accident', count: 46 },
    { cat: 'Violent crime', count: 35 },
    { cat: 'Missing / locate person', count: 22 },
  ],
  weekday: [
    { day: 'Mon', count: 273 },
    { day: 'Tue', count: 358 },
    { day: 'Wed', count: 749 },
    { day: 'Thu', count: 644 },
    { day: 'Fri', count: 560 },
    { day: 'Sat', count: 270 },
    { day: 'Sun', count: 126 },
  ],
  hours: [
    { hour: 0, count: 64 }, { hour: 1, count: 81 }, { hour: 2, count: 48 }, { hour: 3, count: 29 },
    { hour: 4, count: 53 }, { hour: 5, count: 111 }, { hour: 6, count: 78 }, { hour: 7, count: 157 },
    { hour: 8, count: 159 }, { hour: 9, count: 182 }, { hour: 10, count: 73 }, { hour: 11, count: 47 },
    { hour: 12, count: 70 }, { hour: 13, count: 240 }, { hour: 14, count: 162 }, { hour: 15, count: 258 },
    { hour: 16, count: 180 }, { hour: 17, count: 173 }, { hour: 18, count: 162 }, { hour: 19, count: 229 },
    { hour: 20, count: 134 }, { hour: 21, count: 127 }, { hour: 22, count: 57 }, { hour: 23, count: 106 },
  ],
  source:
    'Source: Flock Safety audit export for University of Houston TX PD · License plate values redacted in source · Reason categories derived by keyword grouping of free-text entries',
};
