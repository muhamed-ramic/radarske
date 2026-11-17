import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CacheBanner } from './components/CacheBanner';
import { CantonAndCitySelector } from './components/CantonAndCitySelector';
import { AnnouncedRadarList } from './components/AnnouncedRadarList';
import { StationaryRadarList } from './components/StationaryRadarList';
import { CacheInspectorModal } from './components/CacheInspectorModal';
import { 
  fetchRadarData, 
  getCachedRadarData, 
  clearRadarCache, 
  simulateNextDayInCache,
  CacheMetadata 
} from './services/radarService';
import { 
  ScrapedRadarResponse, 
  DEFAULT_CANTONS, 
  TARGET_CITIES 
} from './data/fallbackData';
import { Shield, Camera, Clock, CheckCircle, Info } from 'lucide-react';

export function App() {
  const [selectedCanton, setSelectedCanton] = useState<string>('93'); // Srednjobosanski by default
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'announced' | 'stationary'>('announced');
  const [radarData, setRadarData] = useState<ScrapedRadarResponse | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Main data loader
  const loadData = async (cantonId: string, force: boolean = false) => {
    setLoading(true);
    setNotice(null);
    try {
      const result = await fetchRadarData(cantonId, force);
      setRadarData(result.data);
      setCacheInfo(result.cacheInfo);

      if (result.fromCache) {
        setNotice(`📦 Podaci su uspješno učitani iz lokalnog keša za danas (${result.cacheInfo?.date}). Nije bilo potrebe za novim mrežnim scrapeom.`);
      } else {
        setNotice(`⚡ Uspješno preuzeti najnoviji podaci sa bihamk.ba za ${result.data.canton.name} i pohranjeni u dnevni keš.`);
      }
    } catch (err: any) {
      console.error('Greška pri dohvatanju podataka:', err);
      setNotice(`Upozorenje: Došlo je do greške (${err.message}). Prikazuju se lokalni podaci.`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData(selectedCanton, false);
  }, [selectedCanton]);

  // City counts calculation
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TARGET_CITIES.forEach((c) => { counts[c] = 0; });

    if (radarData?.announcedRadars) {
      radarData.announcedRadars.forEach((r) => {
        TARGET_CITIES.forEach((tc) => {
          if (r.city.toLowerCase().includes(tc.toLowerCase()) || r.station.toLowerCase().includes(tc.toLowerCase())) {
            counts[tc] = (counts[tc] || 0) + r.entries.length;
          }
        });
      });
    }
    return counts;
  }, [radarData]);

  const totalAnnouncedEntriesCount = useMemo(() => {
    if (!radarData?.announcedRadars) return 0;
    return radarData.announcedRadars.reduce((acc, r) => acc + (r.entries?.length || 1), 0);
  }, [radarData]);

  // Handlers
  const handleForceRefresh = () => {
    loadData(selectedCanton, true);
  };

  const handleSimulateTomorrow = () => {
    simulateNextDayInCache();
    // Re-check cache info
    const updated = getCachedRadarData(selectedCanton);
    setCacheInfo(updated);
    setNotice('🗓️ Datum keša je promijenjen na jučer. Sljedeće učitavanje će automatski prepoznati novi dan i preuzeti nove podatke!');
    // Trigger loadData (which should now detect date mismatch and fetch fresh data!)
    setTimeout(() => {
      loadData(selectedCanton, false);
    }, 600);
  };

  const handleClearCache = () => {
    clearRadarCache();
    setCacheInfo(null);
    setNotice('Keš je obrisan. Preuzimam svježe podatke sa stranice...');
    loadData(selectedCanton, true);
  };

  const availableCantons = radarData?.availableCantons || DEFAULT_CANTONS;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        cacheInfo={cacheInfo}
        loading={loading}
        onRefresh={handleForceRefresh}
        onOpenCacheInspector={() => setIsInspectorOpen(true)}
      />

      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        {/* Notice alert */}
        {notice && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginTop: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} className="text-green-600" />
              <span>{notice}</span>
            </div>
            <button 
              onClick={() => setNotice(null)}
              style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}
            >
              U redu
            </button>
          </div>
        )}

        {/* Cache status info banner */}
        <CacheBanner
          cacheInfo={cacheInfo}
          onSimulateTomorrow={handleSimulateTomorrow}
          onForceRefresh={handleForceRefresh}
        />

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Shield size={22} />
            </div>
            <div>
              <div className="stat-val">{radarData?.announcedRadars?.length || 0}</div>
              <div className="stat-label">Policijskih stanica</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="stat-val">{totalAnnouncedEntriesCount}</div>
              <div className="stat-label">Najavljenih lokacija</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              <Camera size={22} />
            </div>
            <div>
              <div className="stat-val">{radarData?.stationaryRadars?.length || 0}</div>
              <div className="stat-label">Stacionarnih kamera</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              <Info size={22} />
            </div>
            <div>
              <div className="stat-val" style={{ fontSize: '1rem', fontWeight: 800 }}>
                {cacheInfo?.isToday ? 'Danas aktivno' : 'Ažuriranje...'}
              </div>
              <div className="stat-label">Keš status</div>
            </div>
          </div>
        </div>

        {/* Toolbar: Canton & City selection */}
        <CantonAndCitySelector
          cantons={availableCantons}
          selectedCanton={selectedCanton}
          onSelectCanton={(id) => setSelectedCanton(id)}
          selectedCity={selectedCity}
          onSelectCity={(city) => setSelectedCity(city)}
          cityCounts={cityCounts}
          totalAnnouncedCount={totalAnnouncedEntriesCount}
        />

        {/* Tabs */}
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'announced' ? 'active' : ''}`}
            onClick={() => setActiveTab('announced')}
          >
            <Shield size={18} />
            <span>Najavljene radarske kontrole ({radarData?.announcedRadars?.length || 0})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'stationary' ? 'active' : ''}`}
            onClick={() => setActiveTab('stationary')}
          >
            <Camera size={18} />
            <span>Stacionarni radari ({radarData?.stationaryRadars?.length || 0})</span>
          </button>
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="empty-state">
            <div className="live-dot" style={{ width: 16, height: 16, margin: '0 auto 1rem' }}></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
              Učitavanje radarskih podataka sa BIHAMK-a...
            </h3>
            <p style={{ fontSize: '0.85rem' }}>
              Provjeravam lokalni keš i preuzimam najnovije podatke za kanton {selectedCanton}...
            </p>
          </div>
        ) : activeTab === 'announced' ? (
          <AnnouncedRadarList
            radars={radarData?.announcedRadars || []}
            selectedCity={selectedCity}
          />
        ) : (
          <StationaryRadarList
            radars={radarData?.stationaryRadars || []}
            selectedCity={selectedCity}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem 0',
        fontSize: '0.8rem',
        color: '#64748b',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>
            Podaci se preuzimaju sa službene stranice <strong>bihamk.ba/spi/radari</strong>. 
            Aplikacija je optimizovana za gradove Srednjobosanskog kantona (Bugojno, Gornji Vakuf, Donji Vakuf, Travnik, Novi Travnik, Vitez).
          </p>
          <p style={{ marginTop: '0.25rem', opacity: 0.8 }}>
            Sistem vrši scraping jednom dnevno i čuva podatke u lokalnom kešu. Novi podaci se automatski preuzimaju narednog dana.
          </p>
        </div>
      </footer>

      {/* Cache Inspector Modal */}
      <CacheInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        cacheInfo={cacheInfo}
        onSimulateTomorrow={handleSimulateTomorrow}
        onClearCache={handleClearCache}
      />
    </div>
  );
}

export default App;
