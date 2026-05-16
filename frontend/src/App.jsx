import './App.css'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL;

function App() {

  const [nama, setNama] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // =========================
  // GET DATA
  // =========================
  const getData = async () => {
    try {
      const res = await axios.get(`${API_URL}/pengaduan`);

      console.log("GET DATA:", res.data);

      setData(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.log("GET ERROR:", err.response?.data || err.message);
      setData([]);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  // =========================
  // SUBMIT UPLOAD
  // =========================
  const submitPengaduan = async (e) => {
    e.preventDefault();

    try {

      if (!file) {
        alert("Pilih file dulu");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('deskripsi', deskripsi);
      formData.append('file', file);

      const res = await axios.post(
        `${API_URL}/pengaduan`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("UPLOAD SUCCESS:", res.data);

      alert("Berhasil dikirim 🚀");

      setNama('');
      setDeskripsi('');
      setFile(null);

      getData();

    } catch (err) {
      console.log("❌ UPLOAD ERROR FULL:");
      console.log(err.response?.data || err.message);
      console.log(err);

      alert("Gagal upload 😭 cek console");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">

      <div className="container">

        {/* HEADER */}
        <div className="header">
          <h1>SmartKelurahan</h1>
          <p>Sistem Pengaduan Warga Berbasis Cloud</p>
        </div>

        {/* FORM */}
        <div className="card">
          <h2>Form Pengaduan</h2>

          <form onSubmit={submitPengaduan}>

            <input
              type="text"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />

            <textarea
              placeholder="Deskripsi pengaduan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Kirim Pengaduan"}
            </button>

          </form>
        </div>

        {/* DATA */}
        <div className="grid">

          {data.length === 0 ? (
            <p>Belum ada data</p>
          ) : (
            data.map((item, i) => (
              <div className="card item" key={i}>
                <h3>{item.nama}</h3>
                <p>{item.deskripsi}</p>
                {item.file_url && (
                  <img src={item.file_url} alt="" />
                )}
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  )
}

export default App