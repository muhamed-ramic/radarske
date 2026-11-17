import React from 'react';
import { Radio, RefreshCw, Calendar, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { CacheMetadata } from '../services/radarService';

interface HeaderProps {
  cacheInfo: CacheMetadata | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenCacheInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cacheInfo,
  loading,
  onRefresh,
  onOpenCacheInspector
}) => {
  const todayFormatted = new Date().toLocaleDateString('bs-BA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand-section">
          <div className="brand-logo-badge">
            <Radio size={20} className="text-black" />
            <span>BIHAMK</span>
          </div>
          <div>
            <h1 className="brand-title">Radarske Kontrole</h1>
            <div className="brand-subtitle">
              <span>Automatsko dnevno praćenje</span>
              <span>•</span>
              <span className="live-dot"></span>
              <span>bihamk.ba/spi/radari</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="date-pill">
            <Calendar size={15} className="text-slate-500" />
            <span style={{ textTransform: 'capitalize' }}>{todayFormatted}</span>
          </div>

          {cacheInfo && (
            <div className={`cache-pill ${cacheInfo.isToday ? 'today' : 'expired'}`}>
              {cacheInfo.isToday ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>Keširano za danas</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={14} />
                  <span>Stari keš ({cacheInfo.date})</span>
                </>
              )}
            </div>
          )}

          <button 
            className="btn-secondary"
            onClick={onOpenCacheInspector}
            title="Pregledaj detalje keša i simuliraj sutrašnji dan"
          >
            <Database size={15} />
            <span>Keš podaci</span>
          </button>

          <button 
            className="btn-primary" 
            onClick={onRefresh} 
            disabled={loading}
            title="Prisilno ponovo preuzmi sa bihamk.ba"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Učitavanje...' : 'Osveži podatke'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
