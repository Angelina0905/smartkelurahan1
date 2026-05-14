import './App.css'
import { FaCloudUploadAlt } from 'react-icons/fa'

function App() {
  return (
    <div className="container">

      {/* HERO */}
      <section className="hero">

        <h1>SmartKelurahan</h1>

        <p>
          Platform digital pelayanan masyarakat modern untuk pengaduan warga
          dan administrasi online berbasis cloud computing.
        </p>

      </section>

      {/* FORM */}
      <section className="form-section">

        <div className="form-card">

          <h2>Form Pengaduan Warga</h2>

          <form>

            <input
              type="text"
              placeholder="Masukkan Nama"
            />

            <textarea
              placeholder="Tulis Pengaduan..."
            ></textarea>

            <div className="upload-box">

              <FaCloudUploadAlt size={40} />

              <p>Upload Foto / Dokumen</p>

              <input type="file" />

            </div>

            <button type="submit">
              Kirim Pengaduan
            </button>

          </form>

        </div>

      </section>

      {/* DATA */}
      <section className="data-section">

        <h2>Data Pengaduan</h2>

        <div className="data-card">

          <h3>Jalan Rusak</h3>

          <p>
            Jalan di depan kantor kelurahan rusak dan berlubang.
          </p>

          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt=""
          />

        </div>

      </section>

    </div>
  )
}

export default App