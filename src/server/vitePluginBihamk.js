import { scrapeBihamkRadari } from './bihamkScraper.js';
import { generateDailyFallbackData } from '../data/fallbackData.ts';

export function bihamkScraperPlugin() {
  return {
    name: 'bihamk-scraper-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        
        if (url.pathname === '/api/scrape') {
          const cantonId = url.searchParams.get('canton') || '93';
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');

          try {
            console.log(`[Scraper API] Fetching live data for canton ${cantonId} from bihamk.ba...`);
            const data = await scrapeBihamkRadari(cantonId);
            console.log(`[Scraper API] Successfully scraped ${data.announcedRadars.length} announced radar stations.`);
            res.statusCode = 200;
            res.end(JSON.stringify(data));
          } catch (err) {
            console.warn(`[Scraper API] Live scrape encountered issue (${err.message}). Using fallback daily dataset.`);
            const fallback = generateDailyFallbackData();
            fallback.canton.id = cantonId;
            res.statusCode = 200;
            res.end(JSON.stringify({
              ...fallback,
              scrapeWarning: `Napomena: Preuzimanje sa bihamk.ba nije uspjelo (${err.message}). Učitani su validni dnevni podaci za Srednjobosanski kanton.`
            }));
          }
          return;
        }

        next();
      });
    }
  };
}
