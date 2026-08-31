import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPegawai.css";

function DashboardPegawai() {
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState(null);

  useEffect(() => {
  const nip =
    localStorage.getItem("userNIP");

  fetch(
    `http://localhost:8080/pegawai/profile/${nip}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status) {
        setPegawai(data.data);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}, []);

if (!pegawai) {
  return <h2>Loading...</h2>;
}

  return (
    <div className="pegawai-page">

      {/* HEADER */}
      <div className="pegawai-header">

        <div>
          <h1>Selamat Datang 👋</h1>

          <p>
            Jendela Layanan Internal Ditjen Bimas Kristen
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => navigate("/")}
        >
          Logout
        </button>

      </div>

      {/* PROFIL */}
      <div className="profile-card">

        <div className="profile-avatar">
          👤
        </div>

        <div className="profile-info">

<h2>{pegawai.nama}</h2>

<p>
  NIP : {pegawai.nip}
</p>

<p>
  Unit Kerja :
  {pegawai.unit_organisasi}
</p>

<p>
  Jabatan :
  {pegawai.jabatan}
</p>

<p>
  Pangkat/Golongan :
  {pegawai.pangkat_golongan}
</p>

        </div>

      </div>

      {/* STATISTIK */}
      <div className="stats-grid">

        <div className="stat-card">
          <h2>8</h2>
          <p>Total Pengajuan</p>
        </div>

        <div className="stat-card">
          <h2>2</h2>
          <p>Diproses</p>
        </div>

        <div className="stat-card">
          <h2>5</h2>
          <p>Selesai</p>
        </div>

        <div className="stat-card">
          <h2>1</h2>
          <p>Ditolak</p>
        </div>

      </div>

      {/* MENU LAYANAN */}
      <div className="section-card">

        <h2>Layanan Pegawai</h2>

        <div className="menu-grid">

          <div
            className="menu-card"
            onClick={() =>
              navigate("/kepegawaian/rekomendasi")
            }
          >
            <div className="menu-icon">📑</div>

            <h3>Rekomendasi</h3>

            <p>
              Pengajuan layanan rekomendasi
              kepegawaian.
            </p>
          </div>

          <div
            className="menu-card"
            onClick={() => navigate("/kepegawaian/cuti")}
          >
            <div className="menu-icon">🏖️</div>

            <h3>Cuti Pegawai</h3>

            <p>
              Pengajuan cuti secara online.
            </p>
          </div>

          <div
            className="menu-card"
            onClick={() =>
              navigate("/kepegawaian/skbt")
            }
          >
            <div className="menu-icon">📋</div>

            <h3>SKBT</h3>

            <p>
              Surat Keterangan Bebas Temuan.
            </p>
          </div>

        </div>

      </div>

      {/* RIWAYAT */}
      <div className="section-card">

        <h2>Riwayat Pengajuan Terakhir</h2>

        <table className="history-table">

          <thead>
            <tr>
              <th>Layanan</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>SKBT Mandiri</td>
              <td>10 Juni 2026</td>
              <td>
                <span className="status proses">
                  Diproses
                </span>
              </td>
            </tr>

            <tr>
              <td>Cuti Tahunan</td>
              <td>01 Juni 2026</td>
              <td>
                <span className="status selesai">
                  Disetujui
                </span>
              </td>
            </tr>

            <tr>
              <td>Mutasi Internal</td>
              <td>22 Mei 2026</td>
              <td>
                <span className="status tolak">
                  Ditolak
                </span>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default DashboardPegawai;