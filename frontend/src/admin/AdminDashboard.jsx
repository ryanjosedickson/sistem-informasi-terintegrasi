import "./AdminDashboard.css";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  useState,
  useEffect,
} from "react";

import HariLiburModal from "./HariLiburModal";

export default function AdminDashboard() {
  const navigate = useNavigate();
  console.log("AdminDashboard dirender");
  console.log("URL:", window.location.pathname);
  console.log("Division:", localStorage.getItem("adminDivision"));

 const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const role = localStorage.getItem("userRole");

if (!isLoggedIn || role !== "admin_kepegawaian") {
  return <Navigate to="/login-admin" />;
}

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login-admin");
  };

  const [search, setSearch] = useState("");
const [pengajuan, setPengajuan] = useState([]);
const [showHariLibur, setShowHariLibur] = useState(false);

useEffect(() => {
  fetch("http://localhost:8080/api/pengajuan")
    .then((res) => res.json())
    .then((data) => {
      setPengajuan(data);
    })
    .catch((err) => {
      console.error(err);
    });
}, []);

  const filteredPengajuan = pengajuan.filter(
  (item) =>
    item.nama
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    item.layanan
      .toLowerCase()
      .includes(search.toLowerCase())
);
const getCountdown = (mulai, selesai) => {

  const today = new Date();

  const start = new Date(mulai);

  const end = new Date(selesai);

  if (today < start) {

    const diff = Math.ceil(
      (start - today) /
      (1000 * 60 * 60 * 24)
    );

    return {
      text: `${diff} Hari Lagi`,
      className: "countdown-wait",
    };
  }

  if (today >= start && today <= end) {

    const diff = Math.ceil(
      (today - start) /
      (1000 * 60 * 60 * 24)
    );

    return {
      text: `Hari ke-${diff}`,
      className: "countdown-active",
    };
  }

  return {
    text: "Selesai",
    className: "countdown-finish",
  };
};

  return (
    <div className="admin-page">

      <aside className="sidebar">

  <div className="sidebar-header">
    <h2>Admin Panel</h2>
    <p>BMBPSDM</p>
  </div>

<ul>

  <li
  className="active-menu"
  onClick={() => navigate("/admin-kepegawaian")}
>
  Semua Pengajuan
</li>

  <li
    onClick={() => navigate("/admin-kepegawaian/cuti")}
  >
    Pengajuan Cuti
  </li>

  <li
    onClick={() => setShowHariLibur(true)}
  >
    Hari Libur
  </li>

  <li
    className="logout-menu"
    onClick={handleLogout}
  >
    Logout
  </li>

</ul>

</aside>

      <main className="main-content">

        <div className="page-header">

          <div>
            <h1>Semua Pengajuan</h1>

            <p>
              Daftar seluruh pengajuan layanan
              pegawai yang masuk ke sistem
            </p>
          </div>

          <input
  type="text"
  placeholder="Cari nama pegawai atau layanan..."
  className="search-box"
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
/>

        </div>

        <div className="table-card">

          <table>

            <thead>
              <tr>
                <th>Nama Pegawai</th>
                <th>Jenis Layanan</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

  {filteredPengajuan.length > 0 ? (

    filteredPengajuan.map(
      (item, index) => (
        <tr key={index}>

          <td>{item.nama}</td>

          <td>{item.sub_layanan || item.layanan}</td>

          <td>{item.tanggal_pengajuan}</td>

          <td>
  <span
    className={`status ${
      item.status === "Menunggu"
        ? "pending"
        : item.status === "Diproses"
        ? "process"
        : "approved"
    }`}
  >
    {item.status}
  </span>
</td>

<td>

            <button
              className="detail-btn"
              onClick={() =>
                navigate("/admin-kepegawaian/detail-pengajuan", {
    state: item
})
              }
            >
              Detail
            </button>

          </td>

        </tr>
      )
    )

  ) : (

    <tr>

      <td
        colSpan="5"
        style={{
          textAlign: "center",
          padding: "30px",
          color: "#64748b",
          fontWeight: "500",
        }}
      >
        Tidak ada data yang ditemukan
      </td>

    </tr>

  )}

</tbody>

          </table>

        </div>

      </main>

      {showHariLibur && (
        <HariLiburModal onClose={() => setShowHariLibur(false)} />
      )}

    </div>
  );
}