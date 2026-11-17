import * as cheerio from 'cheerio';

export const TARGET_CITIES = [
  'Bugojno',
  'Gornji Vakuf',
  'Donji Vakuf',
  'Travnik',
  'Novi Travnik',
  'Vitez'
];

export async function scrapeBihamkRadari(cantonId = '93') {
  const baseUrl = 'https://bihamk.ba/spi/radari';
  const livewireUrl = 'https://bihamk.ba/livewire/update';

  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // 1. Initial GET to obtain cookies, CSRF token, and initial Livewire snapshot
  const initialRes = await fetch(baseUrl, {
    headers: { 'User-Agent': userAgent }
  });

  if (!initialRes.ok) {
    throw new Error(`Failed to fetch BIHAMK radari page: ${initialRes.status} ${initialRes.statusText}`);
  }

  // Collect cookies
  const rawCookies = initialRes.headers.getSetCookie 
    ? initialRes.headers.getSetCookie() 
    : [initialRes.headers.get('set-cookie') || ''];
  const cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');

  const html = await initialRes.text();
  const $ = cheerio.load(html);

  const csrfToken = $('meta[name="csrf-token"]').attr('content') || '';
  const lwEl = $('[wire\\:snapshot]');
  const rawSnapshot = lwEl.attr('wire:snapshot');

  if (!csrfToken || !rawSnapshot) {
    throw new Error('Could not find CSRF token or Livewire snapshot on page.');
  }

  // Extract cantons from select options
  const cantons = [];
  $('select[wire\\:model="category_select"] option').each((_, el) => {
    const val = $(el).attr('value');
    const text = $(el).text().trim();
    if (val) {
      cantons.push({ id: val, name: text });
    }
  });

  const selectedCantonObj = cantons.find(c => c.id === cantonId) || {
    id: cantonId,
    name: 'MUP Srednjobosanskog kantona'
  };

  // 2. Livewire POST to select the Canton
  const selectPayload = {
    _token: csrfToken,
    components: [
      {
        snapshot: rawSnapshot,
        updates: { category_select: cantonId },
        calls: [{ path: '', method: 'categorySelect', params: [] }]
      }
    ]
  };

  const selectRes = await fetch(livewireUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
      'X-Livewire': 'true',
      'Cookie': cookieHeader,
      'User-Agent': userAgent
    },
    body: JSON.stringify(selectPayload)
  });

  if (!selectRes.ok) {
    throw new Error(`Livewire categorySelect failed: ${selectRes.status}`);
  }

  const selectData = await selectRes.json();
  const component = selectData.components?.[0];
  const cantonHtml = component?.effects?.html || '';
  let currentSnapshot = component?.snapshot || rawSnapshot;

  const $canton = cheerio.load(cantonHtml);

  // Parse announced radar articles
  const articles = [];
  $canton('article').each((_, el) => {
    const $art = $canton(el);
    const clickAttr = $art.attr('wire:click') || '';
    const modalMatch = clickAttr.match(/loadModal\((\d+)\)/);
    const modalId = modalMatch ? parseInt(modalMatch[1], 10) : null;

    const title = $art.find('h3').text().trim();
    const station = $art.find('div.mb-5 span').first().text().trim() || $art.text().trim();

    articles.push({
      modalId,
      title,
      station
    });
  });

  // 3. For each article, load the modal to get exact radar locations & schedule
  const announcedRadars = [];

  for (const art of articles) {
    if (!art.modalId) continue;

    try {
      const modalPayload = {
        _token: csrfToken,
        components: [
          {
            snapshot: currentSnapshot,
            updates: {},
            calls: [{ path: '', method: 'loadModal', params: [art.modalId] }]
          }
        ]
      };

      const modalRes = await fetch(livewireUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Livewire': 'true',
          'Cookie': cookieHeader,
          'User-Agent': userAgent
        },
        body: JSON.stringify(modalPayload)
      });

      if (modalRes.ok) {
        const modalData = await modalRes.json();
        const modalComp = modalData.components?.[0];
        const modalHtml = modalComp?.effects?.html || '';
        const $modal = cheerio.load(modalHtml);

        // Find modal container
        const modalBox = $modal('[x-show*="modal"], dialog, div[class*="modal"]').first();
        const modalText = modalBox.length ? modalBox.text() : modalHtml;

        // Parse lines
        const lines = modalText
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0 && !l.includes('Zatvori') && !l.includes('Prikaži na google mapi'));

        const dateLine = lines.find(l => l.includes('kontrole za')) || art.title;
        const stationLine = lines.find(l => l.toUpperCase().startsWith('PS ') || l.toUpperCase().startsWith('MUP ')) || art.station;

        // Extract schedule entries e.g. "08:45 do 09:45 sati Vitovije (škola)"
        const scheduleEntries = [];
        const timeRegex = /(\d{1,2}:\d{2})\s*(?:do|-)\s*(\d{1,2}:\d{2})\s*(?:sati|h)?\s*(.+)/i;

        lines.forEach(l => {
          const match = l.match(timeRegex);
          if (match) {
            scheduleEntries.push({
              timeFrom: match[1],
              timeTo: match[2],
              location: match[3].trim(),
              fullText: l
            });
          }
        });

        announcedRadars.push({
          id: art.modalId,
          title: dateLine,
          station: stationLine,
          city: normalizeCity(stationLine),
          entries: scheduleEntries,
          rawLines: lines
        });

        if (modalComp?.snapshot) {
          currentSnapshot = modalComp.snapshot;
        }
      }
    } catch (e) {
      console.warn(`Failed to load modal for ${art.station}:`, e.message);
    }
  }

  // 4. Also fetch stationary (stalni) radars for this canton
  const stationaryRadars = await fetchStationaryRadars({
    csrfToken,
    cookieHeader,
    snapshot: currentSnapshot,
    cantonId,
    userAgent,
    livewireUrl
  });

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

  return {
    date: dateStr,
    scrapedAt: now.toISOString(),
    canton: selectedCantonObj,
    availableCantons: cantons,
    targetCities: TARGET_CITIES,
    announcedRadars,
    stationaryRadars
  };
}

// Helper to fetch stationary radars
async function fetchStationaryRadars({ csrfToken, cookieHeader, snapshot, cantonId, userAgent, livewireUrl }) {
  try {
    const payload = {
      _token: csrfToken,
      components: [
        {
          snapshot,
          updates: { category_select: cantonId },
          calls: [{ path: '', method: 'tabSelect', params: ['stationary'] }]
        }
      ]
    };

    const res = await fetch(livewireUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'X-Livewire': 'true',
        'Cookie': cookieHeader,
        'User-Agent': userAgent
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return [];

    const data = await res.json();
    const html = data.components?.[0]?.effects?.html || '';
    const $ = cheerio.load(html);

    const radars = [];
    $('article').each((_, el) => {
      const $art = $(el);
      const title = $art.find('h3').text().trim();
      const road = $art.find('div.mb-5 span').first().text().trim();
      const clickAttr = $art.attr('wire:click') || '';
      const modalMatch = clickAttr.match(/loadModal\((\d+)\)/);
      const modalId = modalMatch ? parseInt(modalMatch[1], 10) : null;

      radars.push({
        id: modalId,
        title: title || 'Stacionarni radar',
        road: road || 'Magistralni put',
        city: normalizeCity(title + ' ' + road)
      });
    });

    return radars;
  } catch (err) {
    console.warn('Failed to fetch stationary radars:', err.message);
    return [];
  }
}

// Normalizes station/title text to identify city
export function normalizeCity(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('bugojn')) return 'Bugojno';
  if (lower.includes('gornji vakuf') || lower.includes('uskoplj')) return 'Gornji Vakuf';
  if (lower.includes('donji vakuf')) return 'Donji Vakuf';
  if (lower.includes('novi travnik')) return 'Novi Travnik';
  if (lower.includes('travnik')) return 'Travnik';
  if (lower.includes('vitez')) return 'Vitez';
  if (lower.includes('fojnic')) return 'Fojnica';
  if (lower.includes('kiseljak')) return 'Kiseljak';
  if (lower.includes('krešev') || lower.includes('kresev')) return 'Kreševo';
  if (lower.includes('jajc')) return 'Jajce';
  if (lower.includes('busovač') || lower.includes('busovac')) return 'Busovača';
  return 'Ostalo';
}
