import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HalamanUtama.css";
import logo from "../src/assets/logo-kemenag.png";
import Swal from "sweetalert2";

export default function HalamanUtama() {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [showNotif, setShowNotif] =
    useState(false);

  const [notifications, setNotifications] = useState([]);

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  const userName =
    localStorage.getItem("userName") || "Pegawai";
  
  
  const nip = localStorage.getItem("userNIP");

const unreadCount =
notifications.filter(
    n=>n.status==="unread"
).length;

  useEffect(() => {
    if (!nip) return;

    fetch(`http://localhost:8080/api/notifikasi/${nip}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Gagal memuat notifikasi (status ${res.status})`);
        return res.json();
      })
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setNotifications([]); // tetap array kosong, bukan biarkan undefined/object
      });
  }, 
  [nip]);

const handleAccess = (path) => {

  if (!isLoggedIn) {

    Swal.fire({

      icon: "warning",

      title: "Akses Ditolak",

      html: `
        <b>Anda belum login.</b><br><br>
        Silakan login terlebih dahulu untuk mengakses layanan.
      `,

      confirmButtonText: "Login Sekarang",

      confirmButtonColor: "#2563eb",

      showCancelButton: true,

      cancelButtonText: "Nanti",

      cancelButtonColor: "#94a3b8"

    }).then((result)=>{

      if(result.isConfirmed){

        navigate("/login");

      }

    });

    return;

  }

  navigate(path);

};

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userNIP");

    navigate("/");
    window.location.reload();
  };

  const markAllAsRead = async () => {
  await fetch(
    `http://localhost:8080/api/notifikasi/read-all/${nip}`,
    {
      method: "PUT",
    }
  );

  setNotifications((prev) =>
    prev.map((item) => ({
      ...item,
      status: "read",
    }))
  );
};

const handleNotificationClick = async (notif) => {

  // tandai notif ini sudah dibaca
  await fetch(
    `http://localhost:8080/api/notifikasi/read/${notif.id}`,
    {
      method: "PUT",
    }
  );

  // ambil detail pengajuan
  const res = await fetch(
    `http://localhost:8080/api/pengajuan/detail/${notif.pengajuan_id}`
  );

  const pengajuan = await res.json();

  // update state supaya notif berubah jadi read
  setNotifications((prev) =>
    prev.map((item) =>
      item.id === notif.id
        ? {
            ...item,
            status: "read",
          }
        : item
    )
  );

  setShowNotif(false);

  navigate("/kepegawaian/detail-pengajuan", {
  state: pengajuan,
});
};


  return (
    <div className="home-page">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo-section">
          <img
            src={logo}
            alt="Logo Kementerian Agama"
            className="navbar-logo"
          />

          <h2>Jendela Layanan Internal Bimas Kristen</h2>
        </div>

        <div className="menu">

          <a href="/">Beranda</a>

          <a
  href="#kontak"
  onClick={(e) => {
    e.preventDefault();

    document
      .getElementById("kontak")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }}
>
  Kontak
</a>

          {!isLoggedIn ? (
            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          ) : (
            <div className="user-section">

              {/* NOTIFIKASI */}
<div className="notif-wrapper">

<div
  className="notif-icon"
  onClick={() => setShowNotif(!showNotif)}
>
  🔔

  {unreadCount > 0 && (
    <span className="notif-badge">
      {unreadCount}
    </span>
  )}
</div>

  {showNotif && (
<div className="notif-dropdown">

    <div className="notif-header">
        Notifikasi

        {unreadCount > 0 && (
            <button
                className="read-all-btn"
                onClick={markAllAsRead}
            >
                Tandai semua
            </button>
        )}

    </div>

    <div className="notif-body">

        {notifications.length === 0 ? (

            <div className="notif-item">
                Tidak ada notifikasi
            </div>

        ) : (

            notifications.map((notif) => (

                <div
                    key={notif.id}
                    className={`notif-item ${
                        notif.status === "unread"
                            ? "unread"
                            : "read"
                    }`}
                    onClick={() =>
                        handleNotificationClick(notif)
                    }
                >

                    <div className="notif-title">

                        <span className="notif-item-icon">
                            {notif.status === "unread"
                                ? "🔵"
                                : "⚪"}
                        </span>

                        <span className="notif-item-text">
                            {notif.judul}
                        </span>

                    </div>

                    <div className="notif-date">
                        {new Date(
                            notif.created_at
                        ).toLocaleString("id-ID")}
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: "#64748b",
                            marginTop: "5px",
                        }}
                    >
                        {notif.pesan}
                    </div>

                </div>

            ))

        )}

    </div>

</div>
  )}

</div>

              {/* PROFILE */}
              <div className="profile-wrapper">

                <div
                  className="profile-chip"
                  onClick={() =>
                    setShowProfileMenu(
                      !showProfileMenu
                    )
                  }
                >
                   {userName}
                </div>

                {showProfileMenu && (
  <div className="profile-dropdown">

    <button
      onClick={() => navigate("/ganti-password")}
    >
      Ganti Password
    </button>

    <button
      onClick={handleLogout}
    >
      Logout
    </button>

  </div>
)}

              </div>

            </div>
          )}

        </div>

      </nav>

      {/* HERO */}
      <section className="hero">

        <div className="hero-content">

          <img
            src={logo}
            alt="Logo Kementerian Agama"
            className="hero-logo"
          />

          <h1>JENDELA LAYANAN INTERNAL BIMAS KRISTEN</h1>

          <p>
            Sistem Informasi Terintegrasi Direktorat Jenderal
            Bimas Kristen Kementerian Agama Republik Indonesia
          </p>

        </div>

      </section>

      {/* MENU */}
      <section className="services">

        <h2>Pilih Menu Layanan</h2>

        <div className="service-grid">

          <div
            className="service-card"
            onClick={() =>
              handleAccess("/kepegawaian")
            }
          >

            <h3>Kepegawaian & SDM</h3>

            <p>
              Layanan Rekomendasi,
              Cuti Pegawai,
              dan SKBT.
            </p>
          </div>

          <div
            className="service-card"
            onClick={() =>
              handleAccess("/bmn")
            }
          >

            <h3>Barang Milik Negara</h3>

            <p>
              Inventaris Barang,
              Peminjaman,
              dan Pengelolaan Aset.
            </p>
          </div>

          <div
            className="service-card"
            onClick={() =>
              handleAccess("/humasdata")
            }
          >

            <h3>Humas & Data</h3>

            <p>
              Publikasi,
              Dokumentasi,
              dan Statistik Data.
            </p>
          </div>

        </div>

      </section>

{/* FOOTER */}
<footer
  className="footer"
  id="kontak"
>

  <h3>Jendela Layanan Internal Bimas Kristen</h3>

  <p>
    Direktorat Jenderal Bimas Kristen Kementerian Agama Republik Indonesia
  </p>

  <p>
    Sistem Informasi Terintegrasi
  </p>

  <div className="footer-contact">

    <h3>Kontak</h3>

    <p>
      📍 Jl. M.H. Thamrin No. 6 Lt. 10–11,
      Jakarta Pusat
    </p>

    <p>
      ☎️ TU Dirjen: 021-3812583 |
      TU Sekretariat: 021-3846832
    </p>

    <p>
      ☎️ TU Dir. Urag Kristen: 021-3920628 |
      TU Dir. PAK: 021-3920626
    </p>

    <p>
      ✉️ bimaskristen@kemenag.go.id
    </p>

    <p>
      🌐 bimaskristen.kemenag.go.id
    </p>

  </div>

  <p>
    ©2026 Sisfo Ditjen Bimas Kristen
  </p>

      </footer>
    </div>
  );
}


