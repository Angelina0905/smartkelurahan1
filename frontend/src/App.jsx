import './App.css'
import { FaCloudUploadAlt } from 'react-icons/fa'

import axios from 'axios'
import { useEffect, useState } from 'react'

function App() {

  const [nama, setNama] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState(null)

  const [data, setData] = useState([])

  /* =========================
     AMBIL DATA
  ========================= */

  const getData = async () => {

    const res =
      await axios.get(
        'http://localhost:5000/pengaduan'
      )

    setData(res.data)

  }

  useEffect(() => {
    getData()
  }, [])

  /* =========================
     SUBMIT
  ========================= */

  const submitPengaduan = async (e) => {

    e.preventDefault()

    const formData = new FormData()

    formData.append('nama', nama)
    formData.append('deskripsi', deskripsi)
    formData.append('file', file)

    await axios.post(
      'http://localhost:5000/pengaduan',
      formData
    )

    alert('Berhasil Upload 😭🔥')

    setNama('')
    setDeskripsi('')
    setFile(null)

    getData()

  }

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

          <form onSubmit={submitPengaduan}>

            <input
              type="text"
              placeholder="Masukkan Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />

            <textarea
              placeholder="Tulis Pengaduan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            ></textarea>

            <div className="upload-box">

              <FaCloudUploadAlt size={40} />

              <p>Upload Foto / Dokumen</p>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />

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

        {
          data.map((item) => (

            <div className="data-card" key={item.id}>

              <h3>{item.nama}</h3>

              <p>
                {item.deskripsi}
              </p>

              <img
                src={item.file_url}
                alt=""
              />

            </div>

          ))
        }

      </section>

    </div>
  )
}

export default App