import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import type * as Leaflet from 'leaflet';
import { Subscription } from 'rxjs';
import { AlprCamera, AlprDataService, HOUSTON_CENTER, coneLatLngs } from './alpr-data.service';

type LeafletNS = typeof Leaflet;

const COLORS = { flock: '#FBD028', other: '#384D9C', ink: '#1a1f36' } as const;
const CONE_MIN_ZOOM = 15;

interface MapLayers {
  flock: Leaflet.LayerGroup;
  other: Leaflet.LayerGroup;
  conesFlock: Leaflet.LayerGroup;
  conesOther: Leaflet.LayerGroup;
}

@Component({
  selector: 'app-alpr-map',
  standalone: true,
  // Custom elements default to display:inline; force block so the map takes full width.
  host: { class: 'block w-full' },
  // Leaflet builds its DOM outside Angular's template, so these rules must not be view-encapsulated.
  encapsulation: ViewEncapsulation.None,
  styles: `
    app-alpr-map .leaflet-container img,
    app-alpr-map .leaflet-container svg,
    app-alpr-map .leaflet-container canvas {
      max-width: none !important;
      max-height: none !important;
    }
    app-alpr-map .leaflet-container {
      font: inherit;
      color: #1a1f36;
    }
  `,
  template: `
    <section class="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-xl border border-[#384D9C]/20">
      <div #mapEl class="absolute inset-0" role="region" aria-label="Map of license plate reader cameras in the Houston area"></div>

      @if (cssMissing()) {
        <div class="absolute inset-x-3 top-3 z-[1001] rounded-lg bg-red-700 px-4 py-3 text-sm text-white shadow-lg">
          Leaflet stylesheet is not loaded. Add <code>node_modules/leaflet/dist/leaflet.css</code> to
          <code>styles</code> in <code>angular.json</code> and restart <code>ng serve</code>.
        </div>
      }

      <div
        class="absolute bottom-6 left-3 right-3 z-[1000] rounded-lg bg-white/95 px-4 py-3 text-sm shadow-lg sm:bottom-auto sm:left-14 sm:right-auto sm:top-3 sm:max-w-xs"
        aria-live="polite"
      >
       
      </div>
    </section>
  `,
})
export class AlprMapComponent implements OnDestroy {
  @ViewChild('mapEl', { static: true }) private mapEl!: ElementRef<HTMLDivElement>;

  private readonly data = inject(AlprDataService);

  readonly counts = signal<{ total: number; flock: number } | null>(null);
  readonly error = signal<string | null>(null);
  readonly cssMissing = signal(false);

  private L?: LeafletNS;
  private map?: Leaflet.Map;
  private layers?: MapLayers;
  private sub?: Subscription;
  private resizeObserver?: ResizeObserver;

  constructor() {
    // Runs only in the browser, so SSR/prerender never touches Leaflet or window.
    afterNextRender(() => {
      void this.init();
    });
  }

  reload(): void {
    this.subscribe(this.data.refresh());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private async init(): Promise<void> {
    let L: LeafletNS;
    try {
      L = await import('leaflet');
    } catch (err) {
      console.error('[app-alpr-map] Failed to load Leaflet', err);
      this.error.set('Map library failed to load. Check that the "leaflet" package is installed.');
      return;
    }
    this.L = L;

    const el = this.mapEl.nativeElement;
    const map = L.map(el, { preferCanvas: true }).setView(HOUSTON_CENTER, 10);
    this.map = map;

    // leaflet.css positions every pane absolutely; if it is missing, tiles and markers scatter.
    const pane = el.querySelector('.leaflet-pane');
    if (pane && getComputedStyle(pane).position !== 'absolute') {
      this.cssMissing.set(true);
      console.error('[app-alpr-map] leaflet.css is not loaded; add node_modules/leaflet/dist/leaflet.css to angular.json styles.');
    }

    // Leaflet caches the container size at creation; re-measure when the layout changes.
    this.resizeObserver = new ResizeObserver(() => map.invalidateSize());
    this.resizeObserver.observe(el);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const layers: MapLayers = {
      flock: L.layerGroup().addTo(map),
      other: L.layerGroup().addTo(map),
      conesFlock: L.layerGroup(),
      conesOther: L.layerGroup(),
    };
    this.layers = layers;

    L.control
      .layers(
        undefined,
        {
          [swatch(COLORS.flock, COLORS.ink) + 'Flock Safety']: layers.flock,
          [swatch(COLORS.other, '#ffffff') + 'Other ALPR']: layers.other,
        },
        { collapsed: false, position: 'topright' },
      )
      .addTo(map);

    map.on('zoomend overlayadd overlayremove', () => this.syncCones());

    this.subscribe(this.data.getCameras());
  }

  private subscribe(source: ReturnType<AlprDataService['getCameras']>): void {
    this.sub?.unsubscribe();
    this.error.set(null);
    this.counts.set(null);
    this.sub = source.subscribe({
      next: (cams) => {
        this.render(cams);
        this.counts.set({ total: cams.length, flock: cams.filter((c) => c.isFlock).length });
      },
      error: (err: unknown) => {
        console.error('[app-alpr-map] Overpass request failed', err);
        this.error.set(err instanceof Error ? err.message : String(err));
      },
    });
  }

  private render(cameras: AlprCamera[]): void {
    const L = this.L;
    const layers = this.layers;
    if (!L || !layers) return;

    Object.values(layers).forEach((g) => g.clearLayers());

    for (const c of cameras) {
      const fill = c.isFlock ? COLORS.flock : COLORS.other;
      const stroke = c.isFlock ? COLORS.ink : '#ffffff';

      L.circleMarker([c.lat, c.lon], { radius: 6, color: stroke, weight: 2, fillColor: fill, fillOpacity: 1 })
        .bindPopup(popupHtml(c))
        .addTo(c.isFlock ? layers.flock : layers.other);

      for (const bearing of c.directions) {
        L.polygon(coneLatLngs(c.lat, c.lon, bearing), {
          color: fill,
          weight: 1,
          fillColor: fill,
          fillOpacity: 0.25,
          interactive: false,
        }).addTo(c.isFlock ? layers.conesFlock : layers.conesOther);
      }
    }

    this.syncCones();
  }

  private syncCones(): void {
    const map = this.map;
    const layers = this.layers;
    if (!map || !layers) return;
    const zoomOk = map.getZoom() >= CONE_MIN_ZOOM;
    const pairs: [Leaflet.LayerGroup, Leaflet.LayerGroup][] = [
      [layers.flock, layers.conesFlock],
      [layers.other, layers.conesOther],
    ];
    for (const [base, cones] of pairs) {
      const show = zoomOk && map.hasLayer(base);
      if (show && !map.hasLayer(cones)) cones.addTo(map);
      if (!show && map.hasLayer(cones)) map.removeLayer(cones);
    }
  }
}

function swatch(fill: string, border: string): string {
  return (
    `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;` +
    `vertical-align:-1px;background:${fill};border:2px solid ${border};box-shadow:0 0 0 1px ${COLORS.other}"></span>`
  );
}

function esc(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string,
  );
}

function popupHtml(c: AlprCamera): string {
  const t = c.tags;
  const rows = (
    [
      ['Manufacturer', t['manufacturer'] || t['brand']],
      ['Operator', t['operator']],
      ['Direction', t['direction'] || t['camera:direction']],
      ['Mount', t['camera:mount']],
      ['Zone', t['surveillance:zone']],
    ] as [string, string | undefined][]
  )
    .filter(([, v]) => !!v)
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:2px 8px 2px 0;color:#5b6275;font-weight:500">${k}</th>` +
        `<td style="padding:2px 0">${esc(v)}</td></tr>`,
    )
    .join('');

  return (
    `<strong>${c.isFlock ? 'Flock Safety ALPR' : 'ALPR camera'}</strong>` +
    (rows ? `<table style="border-collapse:collapse;margin:6px 0">${rows}</table>` : '<br>') +
    `<a href="https://www.openstreetmap.org/${esc(c.type)}/${esc(c.id)}" target="_blank" rel="noopener" style="color:#384D9C">View on OpenStreetMap</a>`
  );
}