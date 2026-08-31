import "./MutasiInternal.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

function MutasiInternal() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
const [status, setStatus] = useState("Menunggu");

const [suratPermohonan, setSuratPermohonan] =
  useState(null);

const [linkDrive, setLinkDrive] =
  useState("");

const handleSubmit = async () => {

  if (!suratPermohonan) {
    Swal.fire({
      icon: "warning",
      title: "Dokumen belum diupload",
      text: "Upload Surat Permohonan terlebih dahulu.",
    });
    return;
  }

  try {

    const formData = new FormData();

    formData.append("nip", nip);
    formData.append("nama", namaLengkap);
    formData.append("jabatan", jabatan);
    formData.append("unitKerja", unitKerja);

    formData.append(
      "layanan",
      "Mutasi Antar Instansi"
    );

    formData.append(
      "status",
      "Menunggu"
    );

    formData.append(
      "link_drive",
      linkDrive
    );

    formData.append(
      "dataPengajuan",
      JSON.stringify({
        jenis: "Mutasi Antar Instansi"
      })
    );

    formData.append(
      "suratPermohonan",
      suratPermohonan
    );

    const response = await fetch(
      "http://localhost:8080/api/pengajuan",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.success) {

      setSubmitted(true);
      setStatus("Menunggu");

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pengajuan berhasil dikirim.",
      });

    }

  } catch (error) {

    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Pengajuan gagal dikirim.",
    });

  }

};

const [nip, setNip] = useState("");
const [nama, setNama] = useState("");
const [jabatan, setJabatan] = useState("");
const [unitKerja, setUnitKerja] = useState("");

// Gelar akademik diisi manual oleh pegawai saat pengajuan,
// karena bisa berubah-ubah dan tidak tersimpan di data master pegawai.
const [gelarDepan, setGelarDepan] = useState("");
const [gelarBelakang, setGelarBelakang] = useState("");

// Format standar penulisan gelar akademik Indonesia:
// {Gelar Depan} {Nama}, {Gelar Belakang}
const namaLengkap = `${gelarDepan ? gelarDepan.trim() + " " : ""}${nama}${
  gelarBelakang ? ", " + gelarBelakang.trim() : ""
}`.trim();

// Auto-fill data pegawai dari akun yang sedang login,
// supaya pegawai tidak perlu ketik ulang NIP mereka sendiri
useEffect(() => {
  const nipLogin = localStorage.getItem("userNIP");

  if (!nipLogin) return;

  setNip(nipLogin);

  fetch(`http://localhost:8080/api/pegawai/${nipLogin}`)
    .then((res) => res.json())
    .then((data) => {
      setNama(data.nama || "");
      setJabatan(data.jabatan || "");
      setUnitKerja(data.unit_organisasi || "");
    })
    .catch((error) => console.error(error));
}, []);
  return (
    <div className="mutasiinternal-page">

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

        <div>
          <h1>Mutasi Antar Instansi</h1>

          <p>
            Pengajuan perpindahan pegawai antar unit kerja
            dalam lingkungan Kementerian Agama.
          </p>
        </div>

      </div>
      
{!submitted ? (
<>

      {/* PERSYARATAN */}

  <div className="info-card">

  <h2>Persyaratan Umum</h2>

<ol className="number-list">
  <li>
    Surat Pengantar dari Pimpinan Unit Kerja Tujuan
    ke Kepala Badan Litbang dan Diklat.
  </li>

  <li>
    Surat Permohonan dari Pegawai yang mutasi ke
    Pimpinan Unit Kerja Penerima dengan menyebutkan
    jabatan dan alasan usul mutasi.
  </li>

  <li>
    ANJAB dan ABK yang ditandatangani oleh
    Pimpinan Unit Kerja Penerima.
  </li>

  <li>
    SPTJM yang ditandatangani oleh
    Pimpinan Unit Kerja Penerima.
  </li>

  <li>
    Surat Pernyataan Persetujuan dari Pimpinan.
  </li>

  <li>
    ANJAB dan ABK dari Pimpinan Unit Kerja Yang Melepas
    (Minimal Eselon 2).
  </li>

  <li>
    SPTJM dari Kanwil Riau.
  </li>

  <li>
    Surat Pernyataan Persetujuan dari Pimpinan Unit Kerja
    Yang Melepas (Minimal Eselon 2).
  </li>

  <li>
    Surat Keterangan Bebas Temuan yang diterbitkan
    Inspektorat Jenderal dimana PNS berasal.
  </li>

  <li>
    SK Pangkat Terakhir.
  </li>

  <li>
    SK Jabatan Terakhir.
  </li>

  <li>
    SKP 2 (dua) Tahun Terakhir dari e-Kinerja BKN.
  </li>

  <li>
    Surat Pernyataan Tidak Sedang Proses atau Menjalani
    Hukuman Disiplin dan atau Proses Peradilan yang
    ditandatangani oleh Pimpinan Unit Kerja Yang Melepas
    (Minimal Eselon 2).
  </li>

  <li>
    Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar
    atau Ikatan Dinas yang ditandatangani oleh Pimpinan
    Unit Kerja Yang Melepas (Minimal Eselon 2).
  </li>

  <li>
    Surat Keterangan Bebas Temuan yang diterbitkan
    Inspektorat Jenderal dimana PNS berasal.
  </li>
</ol>

</div>
</>

) : (

<div className="tracking-card">

  <h2>Status Pengajuan Mutasi Internal</h2>

<div className="timeline">

  <div className="timeline-item completed">

    <div className="timeline-dot"></div>

    <div className="timeline-content">

      <h4>Pengajuan Dikirim</h4>

      <span>
        {new Date().toLocaleString("id-ID")}
      </span>

      <p>
        {
          status==="Menunggu"
          ? "Menunggu verifikasi admin"
          : status==="Diproses"
          ? "Sedang diverifikasi"
          : "Verifikasi selesai"
        }
      </p>

    </div>

  </div>

  <div
    className={`timeline-item ${
      status==="Menunggu"
        ? "current"
        : status==="Diproses" ||
          status==="Selesai"
        ? "completed"
        : "pending"
    }`}
  >

    <div className="timeline-dot"></div>

    <div className="timeline-content">

      <h4>Sedang Diproses</h4>

      <span>

        {
          status==="Menunggu"
          ? "Menunggu verifikasi admin"
          : "Sedang diproses admin"
        }

      </span>

    </div>

  </div>

  <div
    className={`timeline-item ${
      status==="Selesai"
      ? "completed"
      : "pending"
    }`}
  >

    <div className="timeline-dot"></div>

    <div className="timeline-content">

      <h4>Selesai</h4>

      <span>

        {
          status==="Selesai"
          ? "Permohonan telah selesai"
          : "Menunggu penyelesaian"
        }

      </span>

    </div>

  </div>

</div>

</div>

)}

      {/* FORM DATA PEGAWAI */}


{!submitted && (

<div className="submit-wrapper">

    <div className="form-card">

        <label className="checkbox-wrapper">

            <input type="checkbox" />

            <span>
                Saya menyatakan bahwa data dan dokumen
                yang diunggah adalah benar dan dapat
                dipertanggungjawabkan.
            </span>

        </label>

    </div>
    <div className="form-card">

  <h2>Data Pegawai</h2>

  <div className="form-grid">

    <div className="form-group">
      <label>NIP *</label>

      <input
  type="text"
  value={nip}
  readOnly
/>
    </div>

    <div className="form-group">
      <label>Nama + Gelar Akademik *</label>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="Gelar depan"
          value={gelarDepan}
          onChange={(e) => setGelarDepan(e.target.value)}
          style={{ maxWidth: "110px" }}
        />

        <input
          type="text"
          value={nama}
          readOnly
          style={{ flex: 1 }}
        />

        <input
          type="text"
          placeholder="Gelar belakang"
          value={gelarBelakang}
          onChange={(e) => setGelarBelakang(e.target.value)}
          style={{ maxWidth: "170px" }}
        />
      </div>

      <p style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
        Pratinjau: {namaLengkap || "-"}
      </p>
    </div>

    <div className="form-group">
      <label>Jabatan *</label>

     <input
  type="text"
  value={jabatan}
  readOnly
/>
    </div>

    <div className="form-group">
      <label>Unit / Satuan Kerja Asal *</label>

      <input
  type="text"
  value={unitKerja}
  readOnly
/>
    </div>

  </div>

</div>
      {/* UPLOAD */}

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

    {suratPermohonan && (
      <div className="uploaded-file">
        ✅ {suratPermohonan.name}
      </div>
    )}

    <span>PDF Maks. 10 MB</span>

  </div>

</div>

<div className="form-card">

  <h2>Dokumen Pendukung</h2>

  <div className="form-group">

    <label>
      Link Folder Google Drive
    </label>

    <input
      type="text"
      value={linkDrive}
      onChange={(e) =>
        setLinkDrive(e.target.value)
      }
      placeholder="https://drive.google.com/drive/folders/..."
    />

  </div>

  <div className="drive-note">

    <strong>Catatan:</strong>

    Upload seluruh dokumen persyaratan
    mutasi internal ke Google Drive,
    kemudian tempelkan link folder di atas.

  </div>

</div>

    <button
        className="submit-btn"
        onClick={handleSubmit}
    >
        Ajukan Permohonan
    </button>

</div>

)}

    </div>
  );
}

export default MutasiInternal;