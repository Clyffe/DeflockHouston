import { AuditMonth } from './audit-data';

export interface TipLine {
  k: string;
  v: string;
  strong?: boolean;
}

export interface TipContent {
  title: string;
  lines: TipLine[];
}

export interface Tick {
  y: number;
  label: string;
}

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmt = (n: number): string => n.toLocaleString('en-US');

function ceilTo(v: number, step: number): number {
  return Math.max(step, Math.ceil(v / step) * step);
}

function ticks(yMax: number, y: (v: number) => number): Tick[] {
  return [0, 1, 2, 3, 4].map((i) => {
    const v = (yMax / 4) * i;
    return { y: y(v), label: fmt(Math.round(v)) };
  });
}

// ---------------------------------------------------------------------------
// Stacked monthly bars (search on the bottom, lookup on top)

export interface StackBar {
  key: string;
  x: number;
  w: number;
  cx: number;
  search: { y: number; h: number; rx: number } | null;
  lookup: { y: number; h: number } | null;
  label: string;
  isYear: boolean;
  hitX: number;
  hitW: number;
  tip: TipContent;
}

export interface TimeChart {
  W: number;
  H: number;
  mL: number;
  mR: number;
  mT: number;
  ph: number;
  labelY: number;
  ticks: Tick[];
  bars: StackBar[];
}

export function buildTimeChart(months: AuditMonth[], W = 1120, H = 300): TimeChart {
  const mL = 44, mR = 14, mT = 12, mB = 46;
  const pw = W - mL - mR;
  const ph = H - mT - mB;
  const yMax = ceilTo(Math.max(0, ...months.map((m) => m.total)), 100);
  const y = (v: number) => mT + ph - (v / yMax) * ph;
  const bw = months.length ? pw / months.length : pw;
  const bar = Math.min(bw * 0.62, 34);

  const bars = months.map((m, i): StackBar => {
    const cx = mL + bw * i + bw / 2;
    const x = cx - bar / 2;
    const hS = (m.search / yMax) * ph;
    const hL = (m.lookup / yMax) * ph;
    const yS = mT + ph - hS;
    const [yr, mo] = m.month.split('-');
    const isYear = mo === '01';
    const monthName = MONTHS[Number(mo)] ?? mo;
    return {
      key: m.month,
      x,
      w: bar,
      cx,
      search: m.search > 0 ? { y: yS, h: hS, rx: m.lookup > 0 ? 0 : 3 } : null,
      lookup: m.lookup > 0 ? { y: yS - hL - (m.search > 0 ? 2 : 0), h: hL } : null,
      label: isYear ? yr : monthName,
      isYear,
      hitX: mL + bw * i,
      hitW: bw,
      tip: {
        title: `${monthName} ${yr}`,
        lines: [
          { k: 'Search', v: fmt(m.search) },
          { k: 'Lookup', v: fmt(m.lookup) },
          { k: 'Total', v: fmt(m.total), strong: true },
        ],
      },
    };
  });

  return { W, H, mL, mR, mT, ph, labelY: H - mB + 18, ticks: ticks(yMax, y), bars };
}

// ---------------------------------------------------------------------------
// Horizontal bars (reasons, officers)

export interface HItem {
  label: string;
  value: number;
}

export interface HRow {
  key: string;
  label: string;
  barX: number;
  barY: number;
  barW: number;
  barH: number;
  textY: number;
  valueX: number;
  valueText: string;
  color: string;
  hitY: number;
  hitH: number;
  tip: TipContent;
}

export interface HChart {
  W: number;
  H: number;
  labelX: number;
  rows: HRow[];
}

export function buildHBar(
  items: HItem[],
  opts: { W: number; H: number; labelW: number; pct: boolean; color: (i: number) => string; unit?: string },
): HChart {
  const { W, H, labelW: mL } = opts;
  const mR = 52, mT = 6, mB = 8;
  const pw = W - mL - mR;
  const n = Math.max(items.length, 1);
  const rowH = (H - mT - mB) / n;
  const bh = Math.min(rowH * 0.66, 26);
  const maxV = Math.max(1, ...items.map((d) => d.value));
  const total = items.reduce((s, d) => s + d.value, 0) || 1;
  const unit = opts.unit ?? 'searches';

  const rows = items.map((d, i): HRow => {
    const cy = mT + rowH * i + rowH / 2;
    const w = (d.value / maxV) * pw;
    const pct = Math.round((d.value / total) * 100);
    return {
      key: `${i}-${d.label}`,
      label: d.label,
      barX: mL,
      barY: cy - bh / 2,
      barW: Math.max(w, 2),
      barH: bh,
      textY: cy + 4,
      valueX: mL + Math.max(w, 2) + 7,
      valueText: fmt(d.value) + (opts.pct ? `  (${pct}%)` : ''),
      color: opts.color(i),
      hitY: cy - rowH / 2,
      hitH: rowH,
      tip: { title: d.label, lines: [{ k: '', v: `${fmt(d.value)} ${unit} · ${pct}% of total` }] },
    };
  });

  return { W, H, labelX: mL - 9, rows };
}

// ---------------------------------------------------------------------------
// Vertical bars (weekday, hour)

export interface VItem {
  label: string | null;
  tipTitle: string;
  value: number;
}

export interface VBar {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  label: string | null;
  hitX: number;
  hitW: number;
  tip: TipContent;
}

export interface VChart {
  W: number;
  H: number;
  mL: number;
  mR: number;
  mT: number;
  ph: number;
  labelY: number;
  ticks: Tick[];
  bars: VBar[];
}

export function buildVBar(items: VItem[], opts: { W: number; H: number; step: number; unit?: string }): VChart {
  const { W, H, step } = opts;
  const mL = 34, mR = 10, mT = 12, mB = 30;
  const pw = W - mL - mR;
  const ph = H - mT - mB;
  const yMax = ceilTo(Math.max(0, ...items.map((d) => d.value)), step);
  const y = (v: number) => mT + ph - (v / yMax) * ph;
  const bw = items.length ? pw / items.length : pw;
  const bar = Math.min(bw * 0.66, 28);
  const unit = opts.unit ?? 'searches';

  const bars = items.map((d, i): VBar => {
    const cx = mL + bw * i + bw / 2;
    const h = Math.max((d.value / yMax) * ph, 1);
    return {
      key: `${i}`,
      x: cx - bar / 2,
      y: mT + ph - h,
      w: bar,
      h,
      cx,
      label: d.label,
      hitX: mL + bw * i,
      hitW: bw,
      tip: { title: d.tipTitle, lines: [{ k: '', v: `${fmt(d.value)} ${unit}` }] },
    };
  });

  return { W, H, mL, mR, mT, ph, labelY: H - mB + 16, ticks: ticks(yMax, y), bars };
}

export function hourTipLabel(h: number): string {
  const ap = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ap} (UTC)`;
}
