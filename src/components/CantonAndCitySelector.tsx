import React from 'react';
import { MapPin, Building2, Filter } from 'lucide-react';
import { Canton, TARGET_CITIES } from '../data/fallbackData';

interface CantonAndCitySelectorProps {
  cantons: Canton[];
  selectedCanton: string;
  onSelectCanton: (id: string) => void;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  cityCounts: Record<string, number>;
  totalAnnouncedCount: number;
}

export const CantonAndCitySelector: React.FC<CantonAndCitySelectorProps> = ({
  cantons,
  selectedCanton,
  onSelectCanton,
  selectedCity,
  onSelectCity,
  cityCounts,
  totalAnnouncedCount
}) => {
  return (
    <div className="toolbar-card">
      <div className="toolbar-grid">
        {/* Canton Selector */}
        <div>
          <label className="toolbar-label">
            <Building2 size={16} />
            <span>Kanton / Policijska uprava</span>
          </label>
          <select 
            className="custom-select"
            value={selectedCanton}
            onChange={(e) => onSelectCanton(e.target.value)}
          >
            {cantons.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.id === '93' ? '★ (Srednjobosanski)' : ''}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Odabirom drugog kantona automatski se pokreće preuzimanje sa bihamk.ba
          </p>
        </div>

        {/* City Filter Selection */}
        <div>
          <label className="toolbar-label">
            <Filter size={16} />
            <span>Filter po gradovima (Srednjobosanski kanton)</span>
          </label>
          <div className="city-pills-container">
            <button
              className={`city-pill ${selectedCity === null ? 'active' : ''}`}
              onClick={() => onSelectCity(null)}
            >
              <span>Svi gradovi</span>
              <span className="city-badge-count">{totalAnnouncedCount}</span>
            </button>

            {TARGET_CITIES.map((city) => {
              const count = cityCounts[city] || 0;
              const isActive = selectedCity === city;
              return (
                <button
                  key={city}
                  className={`city-pill ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectCity(city)}
                >
                  <MapPin size={13} />
                  <span>{city}</span>
                  <span className="city-badge-count">{count}</span>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
            Ciljani gradovi: <strong>Bugojno, Gornji Vakuf, Donji Vakuf, Travnik, Novi Travnik, Vitez</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
