import React from 'react';
import { Database, Clock, CalendarClock, FastForward } from 'lucide-react';
import { CacheMetadata } from '../services/radarService';

interface CacheBannerProps {
  cacheInfo: CacheMetadata | null;
  onSimulateTomorrow: () => void;
  onForceRefresh: () => void;
}

export const CacheBanner: React.FC<CacheBannerProps> = ({
  cacheInfo,
  onSimulateTomorrow,
  onForceRefresh
}) => {
  const scrapedTimeFormatted = cacheInfo?.scrapedAt 
    ? new Date(cacheInfo.scrapedAt).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className="cache-banner">
      <div className="cache-banner-content">
        <div className="cache-icon-wrapper">
          <Database size={28} />
        </div>
        <div>
          <div className="cache-title">
            <span>Dnevni Keš Sistem</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.85 }}>
              (1 scrape dnevno)
            </span>
          </div>
          <p className="cache-desc">
            Aplikacija automatski preuzima podatke sa <strong>bihamk.ba/spi/radari</strong> jednom dnevno i pohranjuje ih u lokalni keš. 
            Prilikom svake posjete tokom istog dana koriste se spremljeni podaci. Sutra, pri prvom ulasku na stranicu, automatski se preuzimaju novi podaci.
          </p>

          <div className="cache-meta-chips">
            <span className="cache-chip">
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
              Zadnji scrape: {scrapedTimeFormatted} h
            </span>
            <span className="cache-chip">
              <CalendarClock size={12} style={{ display: 'inline', marginRight: 4 }} />
              Datum keša: {cacheInfo?.date || 'N/A'}
            </span>
            <span className="cache-chip">
              Status: {cacheInfo?.isToday ? '🟢 Aktivan za danas' : '🟡 Zastarjeo (potrebno osvježiti)'}
            </span>
            {cacheInfo?.cantonName && (
              <span className="cache-chip">
                Kanton: {cacheInfo.cantonName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="cache-actions">
        <button 
          className="btn-secondary" 
          onClick={onSimulateTomorrow}
          title="Promijeni datum spremljenog keša na jučerašnji kako biste testirali automatsko osvježavanje sutradan"
        >
          <FastForward size={14} className="text-amber-500" />
          <span>Simuliraj sutrašnji dan</span>
        </button>

        <button 
          className="btn-primary" 
          onClick={onForceRefresh}
        >
          <span>Forsiraj preuzimanje</span>
        </button>
      </div>
    </div>
  );
};
