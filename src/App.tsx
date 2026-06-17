import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Map as MapIcon, FileText, Users, Bell, Radio, Settings, ShieldAlert } from 'lucide-react';

export default function App() {
  const [satgas, setSatgas] = useState<any[]>([]);
  const [laporan, setLaporan] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'satgas' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'laporan' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function fetchData() {
    const { data: sData } = await supabase.from('satgas').select('*');
    const { data: lData } = await supabase.from('laporan').select('*').order('waktu', { ascending: false }).limit(5);
    if (sData) setSatgas(sData);
    if (lData) setLaporan(lData);
  }

  // Kalkulasi Statistik Top Header
  const tSatgas = satgas.length;
  const tPersonel = satgas.reduce((acc, curr) => acc + (curr.jumlah_anggota || 0), 0);
  const tAman = satgas.filter(s => s.status === 'AMAN').length;
  const tSiaga = satgas.filter(s => s.status === 'SIAGA').length;
  const tDarurat = satgas.filter(s => s.status === 'DARURAT').length;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AMAN': return '#10b981'; // Hijau
      case 'SIAGA': return '#f59e0b'; // Kuning
      case 'DARURAT': return '#ef4444'; // Merah
      case 'PATROLI': return '#3b82f6'; // Biru
      default: return '#64748b';
    }
  };

  const pieData = [
    { name: 'Aman', value: tAman, color: '#10b981' },
    { name: 'Siaga', value: tSiaga, color: '#f59e0b' },
    { name: 'Darurat', value: tDarurat, color: '#ef4444' }
  ];

  const dummyLineData = [{ time: '00:00', val: 10 }, { time: '06:00', val: 25 }, { time: '12:00', val: 40 }, { time: '18:00', val: 35 }, { time: '24:00', val: 50 }];

  return (
    <div className="dashboard-grid">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div style={{ padding: '0 20px 30px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={32} color="#f59e0b" />
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>ANORAGA</h2>
            <small style={{ color: '#94a3b8' }}>COMMAND CENTER</small>
          </div>
        </div>
        <div className="menu-item active"><LayoutDashboard size={20}/> DASHBOARD</div>
        <div className="menu-item"><MapIcon size={20}/> PETA OPERASI</div>
        <div className="menu-item"><FileText size={20}/> LAPORAN TERBARU</div>
        <div className="menu-item"><Users size={20}/> SATGAS</div>
        <div className="menu-item"><Bell size={20}/> ALERT</div>
        <div className="menu-item"><Radio size={20}/> BROADCAST</div>
        <div className="menu-item" style={{ marginTop: '50px' }}><Settings size={20}/> PENGATURAN</div>
      </div>

      {/* HEADER TRAY */}
      <div className="header">
        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="stat-box">
            <small style={{ color: '#64748b', fontWeight: 'bold' }}>TOTAL SATGAS</small>
            <div style={{ fontSize: '1.8rem', color: '#3b82f6', fontWeight: 'bold' }}>{tSatgas} <span style={{fontSize:'1rem', color:'#64748b', fontWeight:'normal'}}>Aktif</span></div>
          </div>
          <div className="stat-box">
            <small style={{ color: '#64748b', fontWeight: 'bold' }}>TOTAL PERSONEL</small>
            <div style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: 'bold' }}>{tPersonel} <span style={{fontSize:'1rem', color:'#64748b', fontWeight:'normal'}}>Orang</span></div>
          </div>
          <div className="stat-box">
            <small style={{ color: '#64748b', fontWeight: 'bold' }}>KONDISI AMAN</small>
            <div style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: 'bold' }}>{tAman}</div>
          </div>
          <div className="stat-box">
            <small style={{ color: '#64748b', fontWeight: 'bold' }}>KONDISI DARURAT</small>
            <div style={{ fontSize: '1.8rem', color: '#ef4444', fontWeight: 'bold' }}>{tDarurat}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{new Date().toLocaleTimeString()} WIB</div>
            <small style={{ color: '#64748b' }}>Operator Pusat</small>
          </div>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>OP</div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* MAP SECTION */}
        <div className="map-section">
          <MapContainer center={[-6.8, 107.1]} zoom={9} style={{ height: '100%', minHeight: '450px' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            {satgas.map((s) => (
              <Marker key={s.id} position={[s.lat || -6.2, s.lng || 106.8]}>
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                      {s.nama} <span className="badge" style={{ backgroundColor: getStatusColor(s.status), color: '#fff', float: 'right' }}>{s.status}</span>
                    </h3>
                    <p style={{ margin: '5px 0' }}><strong>Pimpinan:</strong> {s.pimpinan}</p>
                    <p style={{ margin: '5px 0' }}><strong>Kegiatan:</strong> {s.kegiatan}</p>
                    <p style={{ margin: '5px 0' }}><strong>Lokasi:</strong> {s.lokasi_teks}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* RIGHT PANEL (LAPORAN & CHART) */}
        <div className="right-panel">
          <div className="card-dark">
            <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px' }}>LAPORAN TERBARU</h3>
            {laporan.map((l) => (
              <div key={l.id} style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getStatusColor(l.status), marginTop: '5px' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{l.nama_satgas}</strong>
                    <span className="badge" style={{ backgroundColor: getStatusColor(l.status) }}>{l.status}</span>
                  </div>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>{l.pesan}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card-dark" style={{ flex: 1 }}>
            <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px' }}>STATISTIK KEADAAN</h3>
            <div style={{ height: '200px', marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL */}
        <div className="bottom-panel">
          <div className="card-dark" style={{ gridColumn: '1 / 3' }}>
            <h3 style={{ marginBottom: '15px' }}>GRAFIK AKTIVITAS (24 Jam)</h3>
            <div style={{ height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyLineData}>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card-dark">
            <h3 style={{ marginBottom: '15px' }}>ZONA OPERASI</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', lineHeight: '2' }}>
              <li>🔵 Zona Utara (Aktif)</li>
              <li>🟢 Zona Tengah (Aman)</li>
              <li>🔴 Zona Selatan (Rawan)</li>
              <li>🟡 Zona Barat (Siaga)</li>
            </ul>
          </div>
          <div className="card-dark" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px', textAlign: 'left' }}>CUACA SAAT INI</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>24°C</div>
            <p style={{ color: '#94a3b8', margin: '5px 0' }}>Hujan Ringan</p>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Cianjur, Jawa Barat</p>
          </div>
        </div>

      </div>
    </div>
  );
}
