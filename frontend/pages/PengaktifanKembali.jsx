import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./PengaktifanKembali.css";

function PengaktifanKembali() {
  const navigate = useNavigate();
  const [nip, setNip] = useState("");
const [nama, setNama] = useState("");
const [jabatan, setJabatan] = useState("");
const [pangkat, setPangkat] = useState("");
const [unitKerja, setUnitKerja] = useState("");
const [suratPermohonan, setSuratPermohonan] = useState(null);
const [tanggalPengaktifan, setTanggalPengaktifan] =
  useState("");

const [nomorSK, setNomorSK] =
  useState("");

const [dasarPengaktifan, setDasarPengaktifan] =
  useState("");

const [keterangan, setKeterangan] =
  useState("");

const [linkDrive, setLinkDrive] =
  useState("");


// Auto-fill data pegawai dari akun yang sedang login,
// supaya pegawai tidak perlu ketik ulang NIP mereka sendiri
useEffect(() => {
  const nipLogin = localStorage.getItem("userNIP");

  if (!nipLogin) return;

  setNip(nipLogin);

  fetch(`http://localhost:8080/api/pegawai/${nipLogin}`)
    .then((res) => res.json())
    .then((data) => {
      if (data) {
        setNama(data.nama || "");
        setJabatan(data.jabatan || "");
        setPangkat(data.pangkat_golongan || "");
        setUnitKerja(data.unit_organisasi || "");
      }
    })
    .catch((error) => console.error(error));
}, []);

const handleSubmit = async () => {

    try {

        const formData = new FormData();
        formData.append(
    "link_drive",
    linkDrive
);

        formData.append("nip", nip);
        formData.append("nama", nama);
        formData.append("jabatan", jabatan);
        formData.append("pangkat", pangkat);
        formData.append(
    "unit_kerja",
    unitKerja
);

formData.append(
    "layanan",
    "Rekomendasi"
);

formData.append(
    "subLayanan",
    "Pengaktifan Kembali"
);

        formData.append("status", "Menunggu");

        formData.append(
            "dataPengajuan",
            JSON.stringify({

                tanggalPengaktifan,
                nomorSK,
                dasarPengaktifan,
                keterangan

            })
        );

        formData.append(
            "link_drive",
            linkDrive
        );

       if (suratPermohonan) {
    formData.append(
        "suratPermohonan",
        suratPermohonan
    );
}

// CEK DATA YANG AKAN DIKIRIM
console.log("===== FORM DATA =====");

for (const pair of formData.entries()) {
  console.log(pair[0], "=", pair[1]);
}

const response = await fetch(
    "http://localhost:8080/api/pengajuan",
    {
        method: "POST",
        body: formData
    }
);

const result = await response.json();

console.log(result);

if (!response.ok) {
    throw new Error(result.error || result.message);
}
setSubmitted(true);
setStatus("Menunggu");

await Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: result.message,
});

    }

    catch(error){

        console.error(error);

    }

};

  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("Menunggu");

  return (
    <div className="pengaktifan-page">

      <button
  className="back-button"
  onClick={() => navigate("/kepegawaian/rekomendasi")}
>
  <img
    src="/logo-back.png"
    alt="Back"
    className="back-icon"
  />
  <span>Kembali</span>
</button>

      {/* HEADER */}

      <div className="page-header">

        <div className="header-icon">
          🔄
        </div>

        <div>
          <h1>Pengaktifan Kembali Jabatan Fungsional</h1>

          <p>
            Pengajuan pengaktifan kembali jabatan fungsional
            bagi pegawai yang telah memenuhi ketentuan sesuai
            peraturan yang berlaku.
          </p>
        </div>

      </div>

      {!submitted ? (
  <>

      {/* STEPPER */}

      <div className="stepper">

        <div className="step active">
          <div className="step-number">1</div>
          <span>Data Pegawai</span>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <span>Pengajuan</span>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <span>Dokumen</span>
        </div>

        <div className="step">
          <div className="step-number">4</div>
          <span>Selesai</span>
        </div>

      </div>

      {/* DATA PEGAWAI */}

      <div className="form-card">

        <h2>Data Pegawai</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>NIP</label>

            <input
  type="text"
  value={nip}
  readOnly
/>
          </div>

          <div className="form-group">
            <label>Nama Pegawai</label>

            <input
  type="text"
  value={nama}
  readOnly
/>
          </div>

          <div className="form-group">
            <label>Pangkat / Golongan</label>

            <input
  type="text"
  value={pangkat}
  readOnly
/>
          </div>

          <div className="form-group">
            <label>Jabatan Fungsional</label>

            <input
  type="text"
  value={jabatan}
  readOnly
/>
          </div>

          <div className="form-group">
            <label>Unit Kerja</label>

            <input
  type="text"
  value={unitKerja}
  readOnly
/>
          </div>

          <div className="form-group">
            <label>Nomor HP</label>

            <input
              type="text"
              placeholder="Masukkan Nomor HP"
            />
          </div>

        </div>

      </div>

      {/* DATA PENGAJUAN */}

      <div className="form-card">

        <h2>Data Pengajuan</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Tanggal Pengaktifan Kembali</label>

            <input
  type="date"
  className="modern-input"
  value={tanggalPengaktifan}
  onChange={(e) =>
    setTanggalPengaktifan(
      e.target.value
    )
  }
/>
          </div>

          <div className="form-group">
            <label>Nomor SK Pemberhentian Sementara</label>

            <input
  type="text"
  placeholder="Masukkan Nomor SK"
  value={nomorSK}
  onChange={(e) =>
    setNomorSK(e.target.value)
  }
/>
          </div>

          <div className="form-group">
            <label>Tanggal SK Pemberhentian</label>

            <input
              type="date"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label>Dasar Pengaktifan Kembali</label>

            <select
  className="modern-select"
  value={dasarPengaktifan}
  onChange={(e) =>
    setDasarPengaktifan(
      e.target.value
    )
  }
>
              <option>Pilih Dasar Pengaktifan</option>
              <option>Selesai Tugas Belajar</option>
              <option>Selesai CLTN</option>
              <option>Kembali dari Penugasan</option>
              <option>Selesai Hukuman Disiplin</option>
              <option>Lainnya</option>
            </select>

          </div>

        </div>

        <div className="form-group full-width">

          <label>Keterangan Pengajuan</label>

          <textarea
  rows="5"
  placeholder="Jelaskan alasan dan dasar pengajuan pengaktifan kembali"
  value={keterangan}
  onChange={(e) =>
    setKeterangan(
      e.target.value
    )
  }
/>

        </div>

      </div>

      {/* UPLOAD DOKUMEN */}

      {/* UPLOAD SURAT PERMOHONAN */}

<div className="form-card">

  <h2>Surat Permohonan</h2>

  <div className="upload-area">

  <div className="upload-icon">
    📄
  </div>

  <label htmlFor="surat">
    Upload Surat Permohonan
  </label>

  <input
    id="surat"
    type="file"
    accept=".pdf"
    onChange={(e) =>
      setSuratPermohonan(
        e.target.files[0]
      )
    }
  />

  {
    suratPermohonan && (
      <div className="uploaded-file">
        ✅ {suratPermohonan.name}
      </div>
    )
  }

  <span>PDF Maks. 10 MB</span>

</div>

</div>

{/* DOKUMEN PENDUKUNG */}

<div className="form-card">

  <h2>Dokumen Pendukung</h2>

  <div className="form-group">

    <label>
      Link Folder Google Drive
    </label>

   <input
  type="text"
  placeholder="https://drive.google.com/drive/folders/..."
  value={linkDrive}
  onChange={(e) =>
    setLinkDrive(
      e.target.value
    )
  }
/>

  </div>

  <div className="drive-note">

    <strong>Upload ke folder Google Drive:</strong>

     <div className="drive-note">
    <strong>Catatan:</strong>
    Upload seluruh dokumen pendukung
    (SK Pemberhentian, SK Pangkat Terakhir,
    SK Jabatan Terakhir, dan dokumen lainnya)
    ke Google Drive, kemudian tempelkan
    link folder di atas.
  </div>

  </div>

</div>

      {/* PERNYATAAN */}

      <div className="form-card">

        <label className="checkbox-wrapper">

          <input type="checkbox" />

          <span>
            Saya menyatakan bahwa data dan dokumen yang
            diunggah adalah benar dan dapat
            dipertanggungjawabkan.
          </span>

        </label>

      </div>

      {/* BUTTON */}

      <div className="button-group">

        <button
  className="submit-btn"
  onClick={handleSubmit}
>
  Ajukan Permohonan
</button>

      </div>

  </>
) : (

  <div className="tracking-card">
  <h2>Status Pengajuan</h2>

  <div className="timeline">

    <div className="timeline-item completed">
      <div className="timeline-dot"></div>

      <div className="timeline-content">
        <h4>Pengajuan Dikirim</h4>

        <span>
          {new Date().toLocaleString("id-ID")}
        </span>
      </div>
    </div>

    <div
      className={`timeline-item ${
        status === "Menunggu"
          ? "current"
          : status === "Diproses" ||
            status === "Selesai"
          ? "completed"
          : "pending"
      }`}
    >
      <div className="timeline-dot"></div>

      <div className="timeline-content">
        <h4>Sedang Diproses</h4>

        <span>
          {status === "Menunggu"
            ? "Menunggu verifikasi admin"
            : status === "Diproses"
            ? "Sedang diverifikasi"
            : "Verifikasi selesai"}
        </span>
      </div>
    </div>

    <div
      className={`timeline-item ${
        status === "Selesai"
          ? "completed"
          : "pending"
      }`}
    >
      <div className="timeline-dot"></div>

      <div className="timeline-content">
        <h4>Selesai</h4>

        <span>
          {status === "Selesai"
            ? "Permohonan telah selesai"
            : "Menunggu penyelesaian"}
        </span>
      </div>
    </div>

  </div>
</div>
)}
    </div>
  );
}

export default PengaktifanKembali;