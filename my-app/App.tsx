import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Gorev {
  id: number;
  baslik: string;
  tamamlandi: boolean;
}

// Canlıda Vercel'deki değişkenden alır, lokalde 8000 portuna bağlanır
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [gorevler, setGorevler] = useState<Gorev[]>([]);
  const [yeniBaslik, setYeniBaslik] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  // Görevleri Getir
  const gorevleriYukle = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gorevler`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGorevler(data);
    } catch {
      toast.error('Görevler sunucudan çekilemedi!');
    }
  };

  useEffect(() => {
    gorevleriYukle();
  }, []);

  // Yeni Görev Ekle
  const gorevEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniBaslik.trim()) return;

    setYukleniyor(true);
    try {
      const res = await fetch(`${API_URL}/api/gorevler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baslik: yeniBaslik }),
      });
      if (!res.ok) throw new Error();
      const eklendi = await res.json();
      setGorevler([...gorevler, eklendi]);
      setYeniBaslik('');
      toast.success('Görev başarıyla eklendi!');
    } catch {
      toast.error('Görev eklenirken hata oluştu!');
    } finally {
      setYukleniyor(false);
    }
  };

  // Tamamlandı / Geri Al
  const durumDegistir = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/gorevler/${id}`, { method: 'PUT' });
      if (!res.ok) throw new Error();
      const guncel = await res.json();
      setGorevler(gorevler.map((g) => (g.id === id ? guncel : g)));
      toast.success('Durum güncellendi.');
    } catch {
      toast.error('Güncelleme başarısız!');
    }
  };

  // Görevi Sil
  const gorevSil = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/gorevler/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setGorevler(gorevler.filter((g) => g.id !== id));
      toast.success('Görev silindi.');
    } catch {
      toast.error('Silme işlemi başarısız!');
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <Toaster position="top-right" />
      <h2 style={{ textAlign: 'center', color: '#111827' }}>⚡ Teknolab Görev Yöneticisi</h2>

      <form onSubmit={gorevEkle} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Yeni bir görev yazın..."
          value={yeniBaslik}
          onChange={(e) => setYeniBaslik(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px' }}
        />
        <button
          type="submit"
          disabled={yukleniyor}
          style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          {yukleniyor ? '...' : 'Ekle'}
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {gorevler.map((g) => (
          <li
            key={g.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '8px',
              border: '1px solid #e5e7eb'
            }}
          >
            <span
              onClick={() => durumDegistir(g.id)}
              style={{
                cursor: 'pointer',
                textDecoration: g.tamamlandi ? 'line-through' : 'none',
                color: g.tamamlandi ? '#9ca3af' : '#1f2937',
                fontSize: '15px'
              }}
            >
              {g.tamamlandi ? '✅' : '⭕'} {g.baslik}
            </span>
            <button
              onClick={() => gorevSil(g.id)}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
      {gorevler.length === 0 && (
        <p style={{ textAlign: 'center', color: '#9ca3af' }}>Henüz kayıtlı bir görev yok.</p>
      )}
    </div>
  );
}