import React, { useState } from 'react';
import { X, Copy, Check, Trash2, FastForward, Database } from 'lucide-react';
import { CacheMetadata, CACHE_STORAGE_KEY } from '../services/radarService';

interface CacheInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cacheInfo: CacheMetadata | null;
  onSimulateTomorrow: () => void;
  onClearCache: () => void;
}

export const CacheInspectorModal: React.FC<CacheInspectorModalProps> = ({
  isOpen,
  onClose,
  cacheInfo,
  onSimulateTomorrow,
  onClearCache
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawJson = cacheInfo ? JSON.stringify(cacheInfo, null, 2) : 'Keš je trenutno prazan.';

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={22} className="text-amber-500" />
            <h3 className="modal-title">Pregled Lokalnog Keša (localStorage)</h3>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
            Ovdje možete vidjeti podatke koji su spremljeni u Vaš preglednik pod ključem <code>{CACHE_STORAGE_KEY}</code>. 
            Aplikacija provjerava ovaj keš pri svakom pokretanju: ako je datum isti kao današnji, koristi se keš bez ponovnog preuzimanja.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            background: '#f8fafc',
            padding: '0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.8rem'
          }}>
            <div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>Datum u kešu:</div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{cacheInfo?.date || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>Status za danas:</div>
              <div style={{ fontWeight: 800, color: cacheInfo?.isToday ? '#16a34a' : '#d97706' }}>
                {cacheInfo?.isToday ? '✓ Važeći za danas' : '⚠ Zastarjeo (novi dan)'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>Starost zapisa:</div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{cacheInfo?.ageInMinutes ?? 0} minuta</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>Spremljeni kanton:</div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{cacheInfo?.cantonName || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Sadržaj JSON objekta
          </span>
          <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={handleCopy}>
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            <span>{copied ? 'Kopirano!' : 'Kopiraj JSON'}</span>
          </button>
        </div>

        <pre className="code-box">
          <code>{rawJson}</code>
        </pre>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
            onClick={() => {
              onClearCache();
              onClose();
            }}
          >
            <Trash2 size={14} />
            <span>Isprazni keš</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-secondary"
              onClick={() => {
                onSimulateTomorrow();
                onClose();
              }}
              title="Promijeni datum keša na jučer da demonstrirate kako aplikacija automatski preuzima nove podatke sutradan"
            >
              <FastForward size={14} className="text-amber-500" />
              <span>Simuliraj sutrašnji dan</span>
            </button>
            <button className="btn-primary" onClick={onClose}>
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
