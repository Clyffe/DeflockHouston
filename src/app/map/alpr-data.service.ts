import { Injectable } from '@angular/core';
import { Observable, defer, shareReplay } from 'rxjs';

export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface AlprCamera {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat: number;
  lon: number;
  tags: Record<string, string>;
  isFlock: boolean;
  directions: number[];
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
  remark?: string;
}

export const HOUSTON_CENTER: [number, number] = [29.7465, -95.3751];

/** Greater Houston: Harris County plus the inner ring of surrounding counties. */
export const HOUSTON_BBOX: BBox = { south: 29.4, west: -96.05, north: 30.15, east: -94.7 };

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const REQUEST_TIMEOUT_MS = 100_000;

const CARDINAL: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

export function buildAlprQuery(b: BBox): string {
  const box = `${b.south},${b.west},${b.north},${b.east}`;
  return `[out:json][timeout:90];
(
  node["surveillance:type"="ALPR"](${box});
  way["surveillance:type"="ALPR"](${box});
);
out center tags;`;
}

const normalizeDeg = (n: number): number => ((n % 360) + 360) % 360;

export function parseDirections(tags: Record<string, string>): number[] {
  const raw = tags['direction'] || tags['camera:direction'] || '';
  const out: number[] = [];
  for (const part of raw.split(';')) {
    const v = part.trim().toUpperCase();
    if (!v) continue;
    if (v in CARDINAL) {
      out.push(CARDINAL[v]);
      continue;
    }
    const range = v.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
    if (range) {
      const a = parseFloat(range[1]);
      const b = parseFloat(range[2]);
      out.push(normalizeDeg(a + normalizeDeg(b - a) / 2));
      continue;
    }
    const n = parseFloat(v);
    if (Number.isFinite(n)) out.push(normalizeDeg(n));
  }
  return out;
}

export function isFlockTagged(tags: Record<string, string>): boolean {
  return /flock/i.test(tags['manufacturer'] ?? '') || /flock/i.test(tags['brand'] ?? '');
}

function toCamera(el: OverpassElement): AlprCamera | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  const tags = el.tags ?? {};
  return {
    id: el.id,
    type: el.type,
    lat,
    lon,
    tags,
    isFlock: isFlockTagged(tags),
    directions: parseDirections(tags),
  };
}

/** Field-of-view wedge as [lat, lon] pairs, sized in meters so it scales with zoom. */
export function coneLatLngs(
  lat: number,
  lon: number,
  bearingDeg: number,
  radiusM = 70,
  halfAngleDeg = 30,
): [number, number][] {
  const mPerDegLat = 111_320;
  const mPerDegLon = 111_320 * Math.cos((lat * Math.PI) / 180);
  const pts: [number, number][] = [[lat, lon]];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const a = ((bearingDeg - halfAngleDeg + (2 * halfAngleDeg * i) / steps) * Math.PI) / 180;
    pts.push([lat + (radiusM * Math.cos(a)) / mPerDegLat, lon + (radiusM * Math.sin(a)) / mPerDegLon]);
  }
  return pts;
}

async function fetchOverpass(query: string): Promise<OverpassElement[]> {
  let lastError: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      // URLSearchParams body => application/x-www-form-urlencoded, a CORS "simple" request (no preflight).
      const res = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: query }), signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
      const json = (await res.json()) as OverpassResponse;
      const elements = json.elements ?? [];
      if (json.remark && elements.length === 0) throw new Error(json.remark);
      return elements;
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('No Overpass endpoint responded');
}

/** No HttpClient dependency: works without provideHttpClient() in the app config. */
@Injectable({ providedIn: 'root' })
export class AlprDataService {
  private cache$?: Observable<AlprCamera[]>;

  /** Cameras for the Houston area, fetched once per app session. */
  getCameras(): Observable<AlprCamera[]> {
    this.cache$ ??= this.fetchCameras(HOUSTON_BBOX).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.cache$;
  }

  refresh(): Observable<AlprCamera[]> {
    this.cache$ = undefined;
    return this.getCameras();
  }

  fetchCameras(bbox: BBox): Observable<AlprCamera[]> {
    return defer(async () => {
      const elements = await fetchOverpass(buildAlprQuery(bbox));
      return elements.map(toCamera).filter((c): c is AlprCamera => c !== null);
    });
  }
}