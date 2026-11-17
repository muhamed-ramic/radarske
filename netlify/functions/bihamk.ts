import type { Config } from '@netlify/functions';
import { scrapeBihamkRadari } from '../../src/server/bihamkScraper.js';
import { generateDailyFallbackData } from '../../src/data/fallbackData.ts';

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
};

export default async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const cantonId = url.searchParams.get('canton') || '93';

    try {
        console.log(`[Scraper API] Fetching live data for canton ${cantonId} from bihamk.ba...`);
        const data = await scrapeBihamkRadari(cantonId);
        console.log(`[Scraper API] Successfully scraped ${data.announcedRadars.length} announced radar stations.`);
        return new Response(JSON.stringify(data), { status: 200, headers });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[Scraper API] Live scrape encountered issue (${message}). Using fallback daily dataset.`);

        const fallback = generateDailyFallbackData();
        fallback.canton.id = cantonId;

        return new Response(
            JSON.stringify({
                ...fallback,
                scrapeWarning: `Napomena: Preuzimanje sa bihamk.ba nije uspjelo (${message}). Učitani su validni dnevni podaci za Srednjobosanski kanton.`,
            }),
            { status: 200, headers }
        );
    }
};

// Serves the function at /api/scrape, so the frontend fetch URL stays unchanged.
export const config: Config = {
    path: '/api/scrape',
};