import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [satgas, setSatgas] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'satgas' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function fetchData() {
    const { data: sData } = await supabase.from('satgas').select('*');
    if (sData) setSatgas(sData);
  }

  const tSatgas = satgas.length;
  const tPersonel = satgas.reduce((acc, curr) => acc + (curr.jumlah_anggota || 0), 0);
  const tDarurat = satgas.filter(s => (s.status || '').toUpperCase() === 'DARURAT').length;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '15px' }}>
      
      {/* HEADER MOBILE */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#1e293b', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6' }}>
          🛡️
        </div>
        <div>
          <h1 style={{ margin: '0', fontSize: '1.2rem', color: '#ffffff', letterSpacing: '1px' }}>ANORAGA</h1>
          <p style={{ margin: '0', fontSize: '0.8rem', color: '#94a3b8' }}>COMMAND CENTER</p>
        </div>
      </header>

      {/* STATISTIK GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', border: '1px solid #334155' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>TOTAL SATGAS</p>
          <p style={{ margin: '0', fontSize: '1.5rem', color: '#3b82f6', fontWeight: 'bold' }}>{tSatgas} <span style={{fontSize:'0.8rem', color:'#64748b', fontWeight:'normal'}}>Aktif</span></p>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', border: '1px solid #334155' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>PERSONEL</p>
          <p style={{ margin: '0', fontSize: '1.5rem', color: '#10b981', fontWeight: 'bold' }}>{tPersonel} <span style={{fontSize:'0.8rem', color:'#64748b', fontWeight:'normal'}}>Org</span></p>
        </div>
      </div>

      {/* ALERT STATUS */}
      {tDarurat > 0 && (
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #ef4444', padding: '12px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fca5a5', fontWeight: 'bold', fontSize: '0.9rem' }}>⚠️ {tDarurat} ZONA DARURAT</span>
          <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>TINDAK LANJUTI</span>
        </div>
      )}

      {/* DAFTAR SATGAS (CARD VIEW UNTUK HP) */}
      <h2 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>STATUS OPERASI WILAYAH</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {satgas.map((s) => (
          <div key={s.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '15px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
            {/* Garis warna status di kiri */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: s.status === 'DARURAT' ? '#ef4444' : s.status === 'SIAGA' ? '#f59e0b' : '#10b981' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 3px 0', fontSize: '1.1rem', color: '#ffffff' }}>{s.nama || s.name}</h3>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#94a3b8' }}>📍 {s.lokasi_teks || s.location || 'Menunggu kordinat...'}</p>
              </div>
              <span style={{ backgroundColor: s.status === 'DARURAT' ? '#7f1d1d' : '#064e3b', color: s.status === 'DARURAT' ? '#fca5a5' : '#6ee7b7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', border: `1px solid ${s.status === 'DARURAT' ? '#ef4444' : '#10b981'}` }}>
                {s.status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Pimpinan</span>
                <strong>{s.pimpinan || '-'}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Kekuatan</span>
                <strong>{s.jumlah_anggota || 0} Anggota</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
