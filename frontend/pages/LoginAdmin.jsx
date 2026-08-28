import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginAdmin.css";
import logo from "../src/assets/logo-kemenag.png";

const API_URL = "http://localhost:8080";

// Role di database -> halaman tujuan setelah login
const ROLE_REDIRECT = {
  admin_kepegawaian: "/admin-kepegawaian",
  admin_bmn:          "/admin-bmn",
  admin_humas:        "/admin-humas",
};

const ROLE_TITLE = {
  kepegawaian: "Admin Kepegawaian",
  bmn:          "Admin BMN",
  humas:        "Admin Humas & Data",
};

function LoginAdmin() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login-admin`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username,
    password,
  }),
});
      const result = await res.json();

      if (!result.status) {
        setErrorMsg(result.message || "NIP atau Password salah.");
        setLoading(false);
        return;
      }

      const user = result.user; // { id, nama, nip, email, role, ... }

      // Pastikan role yang login sesuai dengan divisi admin yang dipilih di layar sebelumnya
      const expectedRole = `admin_${selectedRole}`;
      if (user.role !== expectedRole) {
        setErrorMsg("Akun ini tidak memiliki akses ke divisi admin yang dipilih.");
        setLoading(false);
        return;
      }

      // Simpan sebagai currentUser — dipakai konsisten di semua halaman admin BMN dkk.
      localStorage.clear();

localStorage.setItem("currentUser", JSON.stringify(user));
localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("userRole", user.role);
localStorage.setItem("adminDivision", selectedRole);
localStorage.setItem("userName", user.nama);   // baru
localStorage.setItem("userNIP", user.nip);     // baru


      const tujuan = ROLE_REDIRECT[user.role] || "/";
      navigate(tujuan);

    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => ROLE_TITLE[selectedRole] || "";

  return (
    <div className="login-admin-page">
      <div className="login-admin-container">

        {/* KIRI */}
        <div className="login-admin-left">
          <img src={logo} alt="Logo Kementerian Agama" className="login-logo" style={{ width: 130, height: 130 }} />
          <h1>Login Admin</h1>
          <p>
            Jendela Layanan Internal
            <br />
            Direktorat Jenderal
            <br />
            Bimbingan Masyarakat Kristen
          </p>
        </div>

        {/* KANAN */}
        <div className="login-admin-right">

          {!selectedRole ? (
            <div className="role-selection">
              <h2>Pilih Divisi Admin</h2>

              <button className="role-btn" onClick={() => setSelectedRole("kepegawaian")}>
                Admin Kepegawaian
              </button>

              <button className="role-btn" onClick={() => setSelectedRole("bmn")}>
                Admin BMN
              </button>

              <button className="role-btn" onClick={() => setSelectedRole("humas")}>
                Admin Humas & Data
              </button>

              <div className="back-home-wrapper">
                <button
                  className="switch-login-btn"
                  onClick={() => navigate("/login-user")}
                >
                  <span>Login Sebagai Pegawai</span>
                </button>

                <button
                  className="back-home-btn"
                  onClick={() => navigate("/")}
                >
                  <img src="/logo-back.png" alt="Back" className="back-icon" />
                  <span>Kembali ke Beranda</span>
                </button>
              </div>
            </div>

          ) : (
            <form
              className="login-form"
              onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            >
              <h2>{getRoleTitle()}</h2>

              <div className="form-group">
                <label>Username</label>

<input
  type="text"
  placeholder="Masukkan Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 14, textAlign: "center" }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </button>

              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setSelectedRole("");
                  setUsername("");
                  setPassword("");
                  setErrorMsg("");
                }}
              >
                Ganti Divisi
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;