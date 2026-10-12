import { ChangeDetectionStrategy, Component, HostListener, computed, input, signal } from '@angular/core';
import { AuditData, UH_PD_AUDIT } from './audit-data';
import { TipContent, buildHBar, buildTimeChart, buildVBar, fmt, hourTipLabel } from './audit-charts';

const REASON_RAMP = ['--seq6', '--seq5', '--seq4', '--seq3', '--seq2', '--seq2', '--seq1', '--seq1'];

interface TipState extends TipContent {
  x: number;
  y: number;
}

@Component({
  selector: 'app-audit-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: `
    :host {
      --plane: #f9f9f7; --surface: #fcfcfb;
      --ink: #0b0b0b; --ink2: #52514e; --muted: #898781;
      --grid: #e1e0d9; --axis: #c3c2b7; --border: rgba(11, 11, 11, 0.1);
      --s1: #2a78d6; --s2: #eb6834;
      --seq1: #cde2fb; --seq2: #9ec5f4; --seq3: #5598e7; --seq4: #2a78d6; --seq5: #1c5cab; --seq6: #104281;
      background: var(--plane);
      color: var(--ink);
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 28px 22px 60px; }
    .eyebrow { font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    h1 { font-size: 25px; margin: 4px 0 2px; font-weight: 650; letter-spacing: -.01em; }
    .sub { color: var(--ink2); font-size: 14px; }
    .note { margin-top: 14px; font-size: 12.5px; color: var(--ink2); background: var(--surface); border: 1px solid var(--border);
      border-left: 3px solid var(--s1); border-radius: 8px; padding: 10px 13px; }

    .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 22px 0 8px; }
    .kpi { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 15px 16px; }
    .kpi .v { font-size: 26px; font-weight: 660; letter-spacing: -.02em; line-height: 1.05; font-variant-numeric: tabular-nums; }
    .kpi .l { font-size: 11.5px; color: var(--muted); margin-top: 6px; font-weight: 550; text-transform: uppercase; letter-spacing: .04em; }
    .kpi .d { font-size: 12px; color: var(--ink2); margin-top: 3px; }

    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px 12px; min-width: 0; }
    .card.full { grid-column: 1 / -1; }
    .card h3 { margin: 0; font-size: 14.5px; font-weight: 620; }
    .card .cap { font-size: 12px; color: var(--ink2); margin: 3px 0 12px; }
    .legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: var(--ink2); margin-bottom: 6px; }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .sw { width: 11px; height: 11px; border-radius: 3px; display: inline-block; }

    svg { display: block; width: 100%; height: auto; max-width: none; overflow: visible; }
    text { font-family: inherit; }
    .gridline { stroke: var(--grid); stroke-width: 1; }
    .axl { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }
    .axl.yr { fill: var(--ink2); font-weight: 700; }
    .vlabel { fill: var(--ink); font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
    .rowlabel { fill: var(--ink2); font-size: 12px; }
    .s1 { fill: var(--s1); }
    .s2 { fill: var(--s2); }
    .hoverbar { fill: transparent; cursor: pointer; }
    .hoverbar:hover { fill: rgba(11, 11, 11, 0.04); }

    .tip { position: fixed; pointer-events: none; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 8px 10px; font-size: 12px; color: var(--ink); box-shadow: 0 6px 22px rgba(0, 0, 0, .14); z-index: 1100; max-width: 230px; }
    .tip b { font-weight: 640; }
    .tip .r { color: var(--ink2); }

    footer { margin-top: 26px; font-size: 11.5px; color: var(--muted); text-align: center; line-height: 1.6; }

    @media (max-width: 820px) {
      .kpis { grid-template-columns: repeat(2, 1fr); }
      .grid { grid-template-columns: 1fr; }
    }
  `,
  template: `
    <div class="wrap">
      <header>
        <div class="eyebrow">Flock Safety ALPR Audit Report</div>
        <h1>License-Plate Reader Search Activity</h1>
        <div class="sub">{{ data().org }} · {{ data().date_min }} – {{ data().date_max }}</div>
      </header>

      <div class="note">
        Every row in this audit log is a query an officer ran against Flock Safety's automated license-plate-reader
        (ALPR) network. Each search fans out across many camera networks and devices, so a single query can reach
        thousands of cameras. Reason text is entered freely by officers and has been grouped into categories below; the
        underlying wording is often terse (e.g. "info", a case number).
      </div>

      <div class="kpis">
        @for (k of kpis(); track k.l) {
          <div class="kpi">
            <div class="v">{{ k.v }}</div>
            <div class="l">{{ k.l }}</div>
            <div class="d">{{ k.d }}</div>
          </div>
        }
      </div>

      <div class="grid">
        <!-- Searches over time -->
        <div class="card full">
          <h3>Searches over time</h3>
          <div class="cap">
            Monthly query volume, split by type. <b>Search</b> = network-wide plate search; <b>Lookup</b> = single-record
            retrieval.
          </div>
          <div class="legend">
            <span><i class="sw" style="background: var(--s1)"></i>Search</span>
            <span><i class="sw" style="background: var(--s2)"></i>Lookup</span>
          </div>
          @let t = time();
          <svg [attr.viewBox]="'0 0 ' + t.W + ' ' + t.H" role="img" aria-label="Monthly ALPR searches and lookups">
            @for (tk of t.ticks; track $index) {
              <line class="gridline" [attr.x1]="t.mL" [attr.x2]="t.W - t.mR" [attr.y1]="tk.y" [attr.y2]="tk.y" />
              <text class="axl" text-anchor="end" [attr.x]="t.mL - 8" [attr.y]="tk.y + 4">{{ tk.label }}</text>
            }
            @for (b of t.bars; track b.key) {
              @if (b.search; as s) {
                <rect class="s1" [attr.x]="b.x" [attr.y]="s.y" [attr.width]="b.w" [attr.height]="s.h" [attr.rx]="s.rx" />
              }
              @if (b.lookup; as l) {
                <rect class="s2" [attr.x]="b.x" [attr.y]="l.y" [attr.width]="b.w" [attr.height]="l.h" rx="3" />
              }
              <text class="axl" [class.yr]="b.isYear" text-anchor="middle" [attr.x]="b.cx" [attr.y]="t.labelY">
                {{ b.label }}
              </text>
              <rect
                class="hoverbar"
                [attr.x]="b.hitX"
                [attr.y]="t.mT"
                [attr.width]="b.hitW"
                [attr.height]="t.ph"
                (mousemove)="showTip($event, b.tip)"
                (mouseleave)="hideTip()"
              />
            }
          </svg>
        </div>

        <!-- Horizontal bar charts -->
        @for (c of hCharts(); track c.id) {
          <div class="card">
            <h3>{{ c.title }}</h3>
            <div class="cap">{{ c.caption }}</div>
            <svg [attr.viewBox]="'0 0 ' + c.chart.W + ' ' + c.chart.H" role="img" [attr.aria-label]="c.title">
              @for (r of c.chart.rows; track r.key) {
                <rect [attr.x]="r.barX" [attr.y]="r.barY" [attr.width]="r.barW" [attr.height]="r.barH" rx="3" [attr.fill]="r.color" />
                <text class="rowlabel" text-anchor="end" [attr.x]="c.chart.labelX" [attr.y]="r.textY">{{ r.label }}</text>
                <text class="vlabel" [attr.x]="r.valueX" [attr.y]="r.textY">{{ r.valueText }}</text>
                <rect
                  class="hoverbar"
                  x="0"
                  [attr.y]="r.hitY"
                  [attr.width]="c.chart.W"
                  [attr.height]="r.hitH"
                  (mousemove)="showTip($event, r.tip)"
                  (mouseleave)="hideTip()"
                />
              }
            </svg>
          </div>
        }

        <!-- Vertical bar charts -->
        @for (c of vCharts(); track c.id) {
          <div class="card">
            <h3>{{ c.title }}</h3>
            <div class="cap">{{ c.caption }}</div>
            <svg [attr.viewBox]="'0 0 ' + c.chart.W + ' ' + c.chart.H" role="img" [attr.aria-label]="c.title">
              @for (tk of c.chart.ticks; track $index) {
                <line class="gridline" [attr.x1]="c.chart.mL" [attr.x2]="c.chart.W - c.chart.mR" [attr.y1]="tk.y" [attr.y2]="tk.y" />
                <text class="axl" text-anchor="end" [attr.x]="c.chart.mL - 7" [attr.y]="tk.y + 4">{{ tk.label }}</text>
              }
              @for (b of c.chart.bars; track b.key) {
                <rect class="s1" [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="3" />
                @if (b.label !== null) {
                  <text class="axl" text-anchor="middle" [attr.x]="b.cx" [attr.y]="c.chart.labelY">{{ b.label }}</text>
                }
                <rect
                  class="hoverbar"
                  [attr.x]="b.hitX"
                  [attr.y]="c.chart.mT"
                  [attr.width]="b.hitW"
                  [attr.height]="c.chart.ph"
                  (mousemove)="showTip($event, b.tip)"
                  (mouseleave)="hideTip()"
                />
              }
            </svg>
          </div>
        }
      </div>

      @if (data().source) {
        <footer>{{ data().source }}</footer>
      }
    </div>

    @if (tip(); as tp) {
      <div class="tip" role="tooltip" [style.left.px]="tp.x" [style.top.px]="tp.y">
        <b>{{ tp.title }}</b>
        @for (line of tp.lines; track $index) {
          <br />
          @if (line.k) {
            <span class="r">{{ line.k }}:</span>
          }
          @if (line.strong) {
            <b> {{ line.v }}</b>
          } @else {
            <span [class.r]="!line.k"> {{ line.v }}</span>
          }
        }
      </div>
    }
  `,
})
export class AuditDashboardComponent {
  /** Audit dataset to render. Defaults to the University of Houston PD export. */
  readonly data = input<AuditData>(UH_PD_AUDIT);

  protected readonly tip = signal<TipState | null>(null);

  protected readonly kpis = computed(() => {
    const d = this.data();
    const total = d.total || 1;
    const searchN = d.type.find((t) => t.type === 'search')?.count ?? 0;
    const lookupN = d.type.find((t) => t.type === 'lookup')?.count ?? 0;
    return [
      { v: fmt(d.total), l: 'Total searches', d: `${d.officers_n} officer accounts` },
      { v: fmt(searchN), l: 'Network searches', d: `${Math.round((searchN / total) * 100)}% of activity` },
      { v: fmt(lookupN), l: 'Record lookups', d: `${Math.round((lookupN / total) * 100)}% of activity` },
      { v: fmt(d.avg_devices), l: 'Avg cameras / search', d: `up to ${fmt(d.max_devices)} devices` },
      {
        v: (d.total_device_queries / 1e6).toFixed(1) + 'M',
        l: 'Cumulative camera reach',
        d: `${fmt(d.total_device_queries)} device-queries`,
      },
    ];
  });

  protected readonly time = computed(() => buildTimeChart(this.data().months));

  protected readonly hCharts = computed(() => {
    const d = this.data();
    return [
      {
        id: 'reasons',
        title: 'Why searches were run',
        caption: `Stated reason, grouped into categories (n = ${fmt(d.total)})`,
        chart: buildHBar(
          d.cats.map((c) => ({ label: c.cat, value: c.count })),
          { W: 540, H: 320, labelW: 168, pct: true, color: (i) => `var(${REASON_RAMP[Math.min(i, REASON_RAMP.length - 1)]})` },
        ),
      },
      {
        id: 'officers',
        title: 'Searches by officer',
        caption: 'Top individual accounts by query count',
        chart: buildHBar(
          d.officers.slice(0, 14).map((o) => ({ label: o.name, value: o.count })),
          { W: 540, H: 360, labelW: 150, pct: true, color: () => 'var(--s1)' },
        ),
      },
    ];
  });

  protected readonly vCharts = computed(() => {
    const d = this.data();
    return [
      {
        id: 'weekday',
        title: 'Day-of-week pattern',
        caption: 'When searches were run, by weekday',
        chart: buildVBar(
          d.weekday.map((w) => ({ label: w.day, tipTitle: w.day, value: w.count })),
          { W: 540, H: 260, step: 100 },
        ),
      },
      {
        id: 'hour',
        title: 'Hour-of-day pattern',
        caption: 'Search volume by hour (UTC), 24-hour clock',
        chart: buildVBar(
          d.hours.map((h) => ({ label: h.hour % 3 === 0 ? String(h.hour) : null, tipTitle: hourTipLabel(h.hour), value: h.count })),
          { W: 540, H: 260, step: 50 },
        ),
      },
    ];
  });

  protected showTip(e: MouseEvent, content: TipContent): void {
    const w = 240;
    const h = 96;
    let x = e.clientX + 14;
    let y = e.clientY + 14;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - 14;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - 14;
    this.tip.set({ ...content, x: Math.max(8, x), y: Math.max(8, y) });
  }

  @HostListener('window:scroll')
  protected hideTip(): void {
    if (this.tip()) this.tip.set(null);
  }
}
