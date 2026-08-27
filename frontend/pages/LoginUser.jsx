import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginUser.css";
import logo from "../src/assets/logo-kemenag.png";
import Swal from "sweetalert2";


function LoginUser() {
  const navigate = useNavigate();
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    const response = await fetch(
      "http://localhost:8080/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nip,
          password,
        }),
      }
    );

    const data = await response.json();

if (data.status) {

localStorage.setItem("isLoggedIn", "true");

localStorage.setItem(
  "user",
  JSON.stringify(data.user)
);

localStorage.setItem(
  "currentUser",
  JSON.stringify(data.user)
);

localStorage.setItem("userName", data.user.nama);
localStorage.setItem("userNIP", data.user.nip);
localStorage.setItem("userRole", data.user.role);

  Swal.fire({
    icon: "success",
    title: "Login Berhasil",
    text: `Selamat datang, ${data.user.nama}`,
    confirmButtonColor: "#2563eb",
    confirmButtonText: "Masuk",
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
  }).then(() => {
    navigate("/");
  });

} else {

  Swal.fire({
    icon: "error",
    title: "Login Gagal",
    html: `
      <div style="font-size:15px">
        ${data.message}
      </div>
    `,
    confirmButtonText: "Coba Lagi",
    confirmButtonColor: "#2563eb",
    background: "#ffffff",
    color: "#16324b",
    backdrop: "rgba(22,50,75,.55)",
    customClass: {
      popup: "rounded-popup",
      confirmButton: "rounded-btn",
    },
  });

}

  } catch (error) {
    console.error(error);
    alert("Gagal terhubung ke server");
  }
};

  return (
    <div className="login-user-page">

      <div className="login-user-container">

        {/* KIRI */}
        <div className="login-left">

    <img
        src={logo}
        alt="Logo Kementerian Agama"
        className="login-logo"
    />

          <h1>Login Pegawai</h1>

          <p>
            Jendela Layanan Internal
            <br />
            Direktorat Jenderal
            <br />
            Bimbingan Masyarakat Kristen
          </p>

        </div>

        {/* KANAN */}
        <div className="login-user-right">

          <form
            className="login-form"
            onSubmit={(e) => e.preventDefault()}
          >

            <h2>Masuk ke Sistem</h2>

            <div className="form-group">
              <label>NIP</label>

              <input
                type="text"
                placeholder="Masukkan NIP"
                value={nip}
                onChange={(e) =>
                setNip(e.target.value)
              }
            />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) =>
                setPassword(e.target.value)
              }
            />
            </div>

            <button
              type="button"
              className="login-submit"
              onClick={handleLogin}
            >
              Masuk Sebagai Pegawai
            </button>

{/* BUTTON KEMBALI */}
<div className="back-home-wrapper">
  <button
    className="switch-login-btn"
    onClick={() => navigate("/login-admin")}
  >
    <span>Login Sebagai Admin</span>
  </button>

  <button
    className="back-home-btn"
    onClick={() => navigate("/")}
  >
    <img src="/logo-back.png" alt="Back" className="back-icon" />
    <span>Kembali ke Beranda</span>
  </button>
</div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default LoginUser;