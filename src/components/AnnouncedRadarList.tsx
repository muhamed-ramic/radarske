import React from 'react';
import { ShieldAlert, Clock, MapPin, ExternalLink, AlertCircle, Navigation } from 'lucide-react';
import { AnnouncedRadar, RadarEntry } from '../data/fallbackData';

interface AnnouncedRadarListProps {
  radars: AnnouncedRadar[];
  selectedCity: string | null;
}

export const AnnouncedRadarList: React.FC<AnnouncedRadarListProps> = ({
  radars,
  selectedCity
}) => {
  // Parses "HH:MM" (or "HH.MM" / "HH") into minutes since midnight
  const toMinutes = (time: string): number | null => {
    const match = time.trim().match(/(\d{1,2})(?:[:.](\d{1,2}))?/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const getNowMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Helper to check if a time slot is active right now (hours and minutes)
  const isTimeSlotActive = (timeFrom: string, timeTo: string): boolean => {
    const from = toMinutes(timeFrom);
    const to = toMinutes(timeTo);
    if (from === null || to === null) return false;
    const current = getNowMinutes();
    // Slot crosses midnight (e.g. 23:00 do 01:00)
    if (to < from) {
      return current >= from || current <= to;
    }
    return current >= from && current <= to;
  };

  // Helper to check if a time slot has already ended
  const isTimeSlotPast = (timeFrom: string, timeTo: string): boolean => {
    const from = toMinutes(timeFrom);
    const to = toMinutes(timeTo);
    if (from === null || to === null) return false;
    // A slot that crosses midnight ends after the day is over, so it is never past today
    if (to < from) return false;
    return getNowMinutes() > to;
  };

  const filteredRadars = selectedCity
    ? radars.filter((r) => r.city.toLowerCase().includes(selectedCity.toLowerCase()))
    : radars;

  if (filteredRadars.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={40} className="empty-icon" />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>
          Nema najavljenih radarskih kontrola za odabrani filter
        </h3>
        <p style={{ fontSize: '0.875rem' }}>
          {selectedCity
            ? `Za grad ${selectedCity} policijska uprava danas nije najavila radarske kontrole.`
            : 'Nema dostupnih najavljenih kontrola za odabrani kanton.'}
        </p>
      </div>
    );
  }

  return (
    <div className="cards-grid">
      {filteredRadars.map((radar) => {
        return (
          <div key={radar.id || radar.station} className="station-card">
            {/* Header */}
            <div className="station-header">
              <div className="station-title-group">
                <ShieldAlert size={20} className="text-amber-500" />
                <span className="station-title">{radar.station}</span>
              </div>
              <span className="station-city-badge">{radar.city}</span>
            </div>

            {/* Timetable / Locations */}
            <div className="station-body">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Raspored i lokacije kontrola
              </div>

              {radar.entries.length > 0 ? (
                <div className="timeline-list">
                  {radar.entries.map((entry, idx) => {
                    return (
                      <div
                        key={idx}
                        className="timeline-item"
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="timeline-location">
                            {entry.fullText.replace(/(<\/p>|<\/div>|<p>)/gi, " ")
                              .split(/<br\s*\/>/gi)
                              .map(s => s.trim())
                              .filter(Boolean)
                              .map((loc, i) => {
                                const doIdx = loc.indexOf("do");
                                const hasTime = doIdx > 0;
                                const timeFrom = hasTime ? loc.substring(0, doIdx - 1) : "";
                                const timeTo = hasTime ? loc.substring(doIdx + 2, loc.indexOf("sati") > doIdx ? loc.indexOf("sati") : undefined) : "";
                                const activeNow = hasTime && isTimeSlotActive(timeFrom, timeTo);
                                const pastSlot = hasTime && !activeNow && isTimeSlotPast(timeFrom, timeTo);
                                const chipClass = `location-chip${activeNow ? " location-chip--active" : pastSlot ? " location-chip--past" : ""}`;
                                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  `${loc.replace(/\d+|-/g, "")}, ${radar.city}, BiH`
                                )}`;

                                return (
                                  <span key={i} className={chipClass}>
                                    <a target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }} href={mapsUrl}>
                                      <Navigation size={10} style={{ flexShrink: 0, marginTop: 1 }} />
                                      <span style={{ fontWeight: activeNow ? 700 : 400 }}>{loc}</span>
                                    </a>
                                  </span>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  Lokacije nisu specifikovane ili je radarska kontrola mobilna po potrebi.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="station-footer">
              <span>{radar.title}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} />
                {radar.city}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
