import {
  ScrapedRadarResponse,
  TARGET_CITIES
} from '../data/fallbackData';

export const CACHE_STORAGE_KEY = 'bihamk_radari_daily_cache_v1';

// Returns a canton-specific cache key so different cantons never overwrite each other
function cacheKey(cantonId: string): string {
  return `${CACHE_STORAGE_KEY}_canton_${cantonId}`;
}

export interface CacheMetadata {
  date: string; // YYYY-MM-DD
  scrapedAt: string;
  cantonId: string;
  cantonName: string;
  isToday: boolean;
  ageInMinutes: number;
  data: ScrapedRadarResponse;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCachedRadarData(cantonId: string = '93'): CacheMetadata | null {
  try {
    const raw = localStorage.getItem(cacheKey(cantonId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheMetadata;
    if (!parsed || !parsed.date || !parsed.data) return null;

    // Check if cache belongs to the requested canton
    if (parsed.cantonId !== cantonId) return null;

    const today = getTodayDateString();
    const scrapedTime = new Date(parsed.scrapedAt).getTime();
    const nowTime = Date.now();
    const ageInMinutes = Math.floor((nowTime - scrapedTime) / (1000 * 60));

    return {
      ...parsed,
      isToday: parsed.date === today,
      ageInMinutes
    };
  } catch (err) {
    console.error('Failed reading cache from localStorage:', err);
    return null;
  }
  console.log("finished caching");
}

export function saveRadarDataToCache(data: ScrapedRadarResponse): void {
  try {
    const today = getTodayDateString();
    const cachePayload: CacheMetadata = {
      date: data.date || today,
      scrapedAt: data.scrapedAt || new Date().toISOString(),
      cantonId: data.canton.id,
      cantonName: data.canton.name,
      isToday: true,
      ageInMinutes: 0,
      data
    };
    localStorage.setItem(cacheKey(data.canton.id), JSON.stringify(cachePayload));
  } catch (err) {
    console.error('Failed saving cache to localStorage:', err);
  }
}

export function clearRadarCache(): void {
  // Clear all canton-specific cache keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CACHE_STORAGE_KEY)) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

/**
 * Simulates passing to the next day by backdating the current cache to yesterday.
 * Used to easily demonstrate and test the automatic next-day refresh logic!
 */
export function simulateNextDayInCache(): boolean {
  try {
    // Backdate all canton caches
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(CACHE_STORAGE_KEY)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as CacheMetadata;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      parsed.date = yesterdayStr;
      parsed.isToday = false;
      localStorage.setItem(k, JSON.stringify(parsed));
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchRadarData(
  cantonId: string = '93',
  forceRefresh: boolean = false
): Promise<{ data: ScrapedRadarResponse; fromCache: boolean; cacheInfo: CacheMetadata | null }> {
  const cached = getCachedRadarData(cantonId);
  const today = getTodayDateString();

  // If we have valid cache from today AND not forcing refresh, return cached data!
  if (!forceRefresh && cached && cached.date === today) {
    console.log('[RadarService] Returning valid cache from today:', cached.date);
    return {
      data: cached.data,
      fromCache: true,
      cacheInfo: cached
    };
  }

  console.log(`[RadarService] Cache ${!cached ? 'missing' : 'expired/forced'}. Fetching fresh data from bihamk.ba...`);

  const res = await fetch(`/api/scrape?canton=${encodeURIComponent(cantonId)}${forceRefresh ? '&force=true' : ''}`);

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error) errorDetail = errJson.error;
    } catch {
      // ignore json parse error
    }

    // If we have an existing cache from earlier, use it with notice rather than breaking
    if (cached) {
      console.warn(`[RadarService] Fetch failed (${errorDetail}), using existing cache from ${cached.date}`);
      return {
        data: cached.data,
        fromCache: true,
        cacheInfo: cached
      };
    }

    throw new Error(`Nije moguće preuzeti podatke sa bihamk.ba: ${errorDetail}`);
  }

  const freshData: ScrapedRadarResponse = await res.json();

  // Save to daily cache
  saveRadarDataToCache(freshData);
  const updatedCache = getCachedRadarData(cantonId);

  return {
    data: freshData,
    fromCache: false,
    cacheInfo: updatedCache
  };
}

export function isTargetCity(cityName: string): boolean {
  return TARGET_CITIES.some(tc =>
    cityName.toLowerCase().includes(tc.toLowerCase()) ||
    tc.toLowerCase().includes(cityName.toLowerCase())
  );
}
