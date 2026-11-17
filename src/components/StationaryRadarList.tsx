import React from 'react';
import { Camera, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { StationaryRadar } from '../data/fallbackData';

interface StationaryRadarListProps {
  radars: StationaryRadar[];
  selectedCity: string | null;
}

export const StationaryRadarList: React.FC<StationaryRadarListProps> = ({
  radars,
  selectedCity
}) => {
  const filtered = selectedCity
    ? radars.filter(r => r.city.toLowerCase().includes(selectedCity.toLowerCase()))
    : radars;

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={40} className="empty-icon" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>
          Nema stacionarnih radara za odabrani grad
        </h3>
        <p style={{ fontSize: '0.875rem' }}>
          Za grad {selectedCity || 'ovaj kanton'} nisu evidentirani fiksni stacionarni radari.
        </p>
      </div>
    );
  }

  return (
    <div className="cards-grid">
      {filtered.map((radar, idx) => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${radar.locationDescription || radar.title}, ${radar.city}, BiH`
        )}`;

        return (
          <div key={radar.id || idx} className="stationary-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                background: '#f1f5f9',
                padding: '0.65rem',
                borderRadius: '8px',
                color: '#1e293b'
              }}>
                <Camera size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="road-badge">{radar.road}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: 2 }} />
                    {radar.city}
                  </span>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  {radar.locationDescription || radar.title}
                </div>

                <a 
                  href={mapsUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.75rem',
                    color: '#d97706',
                    fontWeight: 600,
                    marginTop: 4,
                    textDecoration: 'none'
                  }}
                >
                  <span>Prikaži lokaciju</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="speed-limit-circle" title="Ograničenje brzine">
              {radar.speedLimit || 60}
            </div>
          </div>
        );
      })}
    </div>
  );
};
