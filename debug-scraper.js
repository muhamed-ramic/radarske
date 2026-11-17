// Quick debug script to test what the scraper returns
// Run with: node debug-scraper.js

import { scrapeBihamkRadari } from './src/server/bihamkScraper.js';

console.log('=== Starting scraper debug for canton 93 (Srednjobosanski) ===\n');

try {
  const data = await scrapeBihamkRadari('93');
  
  console.log(`Canton: ${data.canton.name} (id: ${data.canton.id})`);
  console.log(`Date: ${data.date}`);
  console.log(`Announced radars: ${data.announcedRadars.length}`);
  console.log(`Stationary radars: ${data.stationaryRadars.length}`);
  console.log(`Available cantons: ${data.availableCantons.map(c => `${c.id}=${c.name}`).join(', ')}`);
  
  console.log('\n=== ANNOUNCED RADARS ===');
  data.announcedRadars.forEach((r, i) => {
    console.log(`\n--- Radar ${i + 1} ---`);
    console.log(`  ID: ${r.id}`);
    console.log(`  Title: ${r.title}`);
    console.log(`  Station: ${r.station}`);
    console.log(`  City: ${r.city}`);
    console.log(`  Entries count: ${r.entries.length}`);
    console.log(`  Raw lines count: ${r.rawLines.length}`);
    
    // Show first 5 entries
    r.entries.slice(0, 5).forEach((e, j) => {
      console.log(`    Entry ${j + 1}: [${e.timeFrom || '?'}-${e.timeTo || '?'}] ${e.location.substring(0, 80)}`);
    });
    if (r.entries.length > 5) {
      console.log(`    ... and ${r.entries.length - 5} more entries`);
    }
    
    // Show first 5 raw lines
    console.log(`  First 5 raw lines:`);
    r.rawLines.slice(0, 5).forEach((l, j) => {
      console.log(`    Line ${j + 1}: "${l.substring(0, 100)}"`);
    });
  });

  console.log('\n=== STATIONARY RADARS (first 5) ===');
  data.stationaryRadars.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.title} | ${r.road} | city: ${r.city}`);
  });

} catch (err) {
  console.error('SCRAPER ERROR:', err.message);
  console.error(err.stack);
}
