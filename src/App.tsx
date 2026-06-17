import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Shield, AlertTriangle, CheckCircle, Radio, Users, MapPin } from 'lucide-react';

interface Satgas {
  id: number;
  nama_satgas: string;
  pimpinan: string;
  jumlah_anggota: number;
  status: 'Aman' | 'Siaga' | 'Patroli' | 'Darurat';
  lokasi_nama: string;
}

export default function App() {
  const [dataSatgas, setDataSatgas] = useState<Satgas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSatgas = async () => {
      const { data } = await supabase.from('satgas').select('*');
      if (data) setDataSatgas(data);
      setLoading(false);
    };

    fetchSatgas();

    // Langsung pantau perubahan database secara realtime
    const channel = supabase
      .channel('changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'satgas' }, () => {
        fetchSatgas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* HEADER BAR */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-wider text-blue-500 flex items-center gap-2">
            <Shield className="text-blue-500 animate-pulse" /> ANORAGA COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-500 mt-1">Sistem Pemantauan Terpadu Satuan Tugas</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-xs font-mono">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span> ONLINE
        </div>
      </header>

      {/* LOADING STATE */}
      {loading ? (
        <div className="text-center py-10 text-slate-500 font-mono animate-pulse">Menghubungkan ke satelit...</div>
      ) : (
        <>
          {/* STATS SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-xs uppercase font-mono mb-1 flex items-center gap-1"><Users size={14}/> Total Posko</div>
              <p className="text-2xl font-bold text-white">{dataSatgas.length}</p>
            </div>
            <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-900/60">
              <div className="text-rose-400 text-xs uppercase font-mono mb-1 flex items-center gap-1"><AlertTriangle size={14}/> Status Darurat</div>
              <p className="text-2xl font-bold text-rose-400">{dataSatgas.filter(s => s.status === 'Darurat').length}</p>
            </div>
            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-900/60 col-span-2 md:col-span-1">
              <div className="text-emerald-400 text-xs uppercase font-mono mb-1 flex items-center gap-1"><CheckCircle size={14}/> Status Aman</div>
              <p className="text-2xl font-bold text-emerald-400">{dataSatgas.filter(s => s.status === 'Aman').length}</p>
            </div>
          </div>

          {/* MAIN MONITORING LIST */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Radio size={16} className="text-blue-500 animate-broadcast" /> Log Aktivitas Posko Utama
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {dataSatgas.map((satgas) => (
                <div key={satgas.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-start hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-500">ID: ACC-00{satgas.id}</span>
                    <h3 className="font-bold text-lg text-slate-100">{satgas.nama_satgas}</h3>
                    <p className="text-xs text-slate-400">Pimpinan: <span className="text-slate-300 font-medium">{satgas.pimpinan}</span></p>
                    <p className="text-xs text-slate-400">Kekuatan Personel: <span className="text-slate-300 font-medium">{satgas.jumlah_anggota} Anggota</span></p>
                    <div className="pt-2 flex items-center gap-1 text-xs text-blue-400">
                      <MapPin size={12} /> <span>{satgas.lokasi_nama}</span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider font-mono ${
                    satgas.status === 'Darurat' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    satgas.status === 'Siaga' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {satgas.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
