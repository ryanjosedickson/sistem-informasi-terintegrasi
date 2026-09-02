import "./Cuti.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";


function Cuti() {

  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // ===========================
  // STATE
  // ===========================

  const [submitted, setSubmitted] = useState(false);
const [sisaCuti, setSisaCuti] = useState("");

  const [pengajuanId, setPengajuanId] = useState(null);

  const [status, setStatus] = useState("Menunggu");

  //==========================
  // DATA PEGAWAI
  //==========================

  const [nip, setNip] = useState("");
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [unitKerja, setUnitKerja] = useState("");

  // Sisa cuti tahunan SEBENARNYA (berdasarkan histori pemakaian
  // tahun berjalan), diambil dari endpoint /api/cuti/sisa/{nip}
  const [sisaCutiSebenarnya, setSisaCutiSebenarnya] = useState(12);

  // Daftar tanggal hari libur (nasional + cuti bersama),
  // dipakai supaya preview durasi tidak ikut menghitung hari itu
  const [hariLiburList, setHariLiburList] = useState([]);

  //==========================
  // CUTI
  //==========================

  const [statusKepegawaian, setStatusKepegawaian] =
    useState("");

  const [jenisCuti, setJenisCuti] =
    useState("");

  const [alasanCuti, setAlasanCuti] =
    useState("");

  const [tanggalMulai, setTanggalMulai] =
    useState("");

  const [tanggalSelesai, setTanggalSelesai] =
    useState("");

  const [durasi, setDurasi] =
    useState("");
  const [lamaCuti, setLamaCuti] = useState("");
  const [satuanCuti, setSatuanCuti] = useState("");

  const [alamatCuti, setAlamatCuti] =
    useState("");

  const [noHp, setNoHp] =
    useState("");

  //==========================
  // DOKUMEN
  //==========================

  const [suratPermohonan, setSuratPermohonan] =
    useState(null);

  const [linkDrive, setLinkDrive] =
    useState("");

      //==========================
  // AUTO-FILL DARI AKUN LOGIN
  //==========================

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
          setUnitKerja(data.unit_organisasi || "");
        }
      })
      .catch((err) => console.error(err));

    // Ambil sisa cuti tahunan SEBENARNYA (sudah memperhitungkan
    // histori pemakaian tahun ini), bukan asumsi 12 hari utuh
    fetch(`http://localhost:8080/api/cuti/sisa/${nipLogin}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.sisa === "number") {
          setSisaCutiSebenarnya(data.sisa);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  //==========================
  // AMBIL DAFTAR HARI LIBUR
  //==========================

  useEffect(() => {
    fetch("http://localhost:8080/api/hari-libur")
      .then((res) => res.json())
      .then((result) => {
        const daftarTanggal = (result.data || []).map((h) => h.tanggal);
        setHariLiburList(daftarTanggal);
      })
      .catch((err) => console.error(err));
  }, []);

  //==========================
  // JENIS CUTI
  //==========================

  const jenisCutiOptions = {

    PNS: [

      "Cuti Tahunan",

      "Cuti Besar",

      "Cuti Sakit",

      "Cuti Melahirkan",

      "Cuti Karena Alasan Penting",

      "Cuti di Luar Tanggungan Negara"

    ],

    PPPK: [

      "Cuti Tahunan",

      "Cuti Sakit",

      "Cuti Melahirkan"

    ]

  };

    //==========================
  // HITUNG DURASI OTOMATIS
  //==========================

  useEffect(() => {

    if (!tanggalMulai || !tanggalSelesai || !jenisCuti) {
    setDurasi("");
    setLamaCuti("");
    setSatuanCuti("");
    setSisaCuti("");
    return;
}

    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);

    if (selesai < mulai) return;

    // Total hari
// Hitung hari kerja (Senin–Jumat, DAN bukan hari libur/cuti bersama)
let totalHari = 0;

let current = new Date(mulai);

// Helper format tanggal lokal (hindari pergeseran akibat toISOString yang pakai UTC)
const formatTanggalLokal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

while (current <= selesai) {

  const hari = current.getDay();
  const tanggalStr = formatTanggalLokal(current);

  // Minggu = 0
  // Sabtu = 6
  const isWeekend = hari === 0 || hari === 6;
  const isHariLibur = hariLiburList.includes(tanggalStr);

  if (!isWeekend && !isHariLibur) {
    totalHari++;
  }

  current.setDate(current.getDate() + 1);

}

setDurasi(totalHari);
if (jenisCuti === "Cuti Tahunan") {
    setSisaCuti(Math.max(0, sisaCutiSebenarnya - totalHari));
} else {
    setSisaCuti("-");
}

    // Hitung tahun, bulan, hari
    let tahun = selesai.getFullYear() - mulai.getFullYear();
    let bulan = selesai.getMonth() - mulai.getMonth();
    let hari = selesai.getDate() - mulai.getDate();

    if (hari < 0) {
        bulan--;
    }

    if (bulan < 0) {
        tahun--;
        bulan += 12;
    }

    if (tahun >= 1 && bulan === 0 && hari === 0) {

        setLamaCuti(tahun);
        setSatuanCuti("Tahun");

    }
    else if (bulan >= 1 && hari === 0) {

        setLamaCuti(bulan);
        setSatuanCuti("Bulan");

    }
    else {

        setLamaCuti(totalHari);
        setSatuanCuti("Hari");

    }

}, [tanggalMulai, tanggalSelesai, jenisCuti, hariLiburList, sisaCutiSebenarnya]);

    //========================================
  // AMBIL DATA PEGAWAI BERDASARKAN NIP
  //========================================

  const handleDownloadSurat = async () => {

  const formData = new FormData();

  formData.append("nip", nip);
  formData.append("nama", nama);
  formData.append("jabatan", jabatan);
  formData.append("unit_kerja", unitKerja);

  formData.append(
    "status_kepegawaian",
    statusKepegawaian
  );

  formData.append(
    "jenis_cuti",
    jenisCuti
  );

  formData.append(
    "alasan_cuti",
    alasanCuti
  );

  formData.append(
    "tanggal_mulai",
    tanggalMulai
  );

  formData.append(
    "tanggal_selesai",
    tanggalSelesai
  );

  formData.append("durasi", durasi);
  formData.append("lama_cuti", lamaCuti);
  formData.append("satuan_cuti", satuanCuti);

  formData.append(
    "alamat_cuti",
    alamatCuti
  );

  formData.append(
    "no_hp",
    noHp
  );

  const response = await fetch(
    "http://localhost:8080/pdf/cuti/preview",
    {
      method: "POST",
      body: formData
    }
  );

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  window.open(url);
};

    //========================================
  // SUBMIT PENGAJUAN
  //========================================

  const handleSubmit = async () => {

    //========================
    // VALIDASI
    //========================

    if (!nip) {

      Swal.fire(
        "Peringatan",
        "Masukkan NIP terlebih dahulu.",
        "warning"
      );

      return;

    }

    if (!statusKepegawaian) {

      Swal.fire(
        "Peringatan",
        "Pilih Status Kepegawaian.",
        "warning"
      );

      return;

    }

    if (!jenisCuti) {

      Swal.fire(
        "Peringatan",
        "Pilih Jenis Cuti.",
        "warning"
      );

      return;

    }

    if (!alasanCuti) {

      Swal.fire(
        "Peringatan",
        "Isi Alasan Cuti.",
        "warning"
      );

      return;

    }

    if (!tanggalMulai || !tanggalSelesai) {

      Swal.fire(
        "Peringatan",
        "Pilih tanggal cuti.",
        "warning"
      );

      return;

    }

    if (!linkDrive) {

      Swal.fire(
        "Peringatan",
        "Masukkan Link Google Drive.",
        "warning"
      );

      return;

    }

    try {
      //=========================
// HITUNG SISA CUTI
//=========================

let sisaCuti = 12;

if (jenisCuti === "Cuti Tahunan") {
    sisaCuti = 12 - Number(durasi);

    if (sisaCuti < 0) {
        sisaCuti = 0;
    }
}

      const formData = new FormData();

            formData.append("nip", nip);

      formData.append("nama", nama);

      formData.append("jabatan", jabatan);

      formData.append(
        "unit_kerja",
        unitKerja
      );

      formData.append(
        "layanan",
        "Cuti"
      );

      formData.append(
        "status_kepegawaian",
        statusKepegawaian
      );

      formData.append(
        "jenis_cuti",
        jenisCuti
      );

      formData.append(
        "alasan_cuti",
        alasanCuti
      );

      formData.append(
        "tanggal_mulai",
        tanggalMulai
      );

      formData.append(
        "tanggal_selesai",
        tanggalSelesai
      );

      formData.append("durasi", durasi);
      formData.append("sisa_cuti", sisaCuti);
      formData.append("lama_cuti", lamaCuti);
      formData.append("satuan_cuti", satuanCuti);

      formData.append(
        "alamat_cuti",
        alamatCuti
      );

      formData.append(
        "no_hp",
        noHp
      );

      formData.append(
        "link_drive",
        linkDrive
      );

      formData.append(
        "suratPermohonan",
        suratPermohonan
      );
            const response = await fetch(

        "http://localhost:8080/api/pengajuan",

        {

          method: "POST",

          body: formData

        }

      );

      const result = await response.json();

      if (result.success) {

        setPengajuanId(result.id);

        setSubmitted(true);

        Swal.fire({

          icon: "success",

          title: "Berhasil",

          text: "Pengajuan berhasil dikirim."

        });

      } else {

        Swal.fire({

          icon: "error",

          title: "Gagal",

          text: result.message

        });

      }

    } catch (err) {

      console.error(err);

      Swal.fire({

        icon: "error",

        title: "Error",

        text: "Terjadi kesalahan."

      });

    }

  };

    //========================================
  // RENDER
  //========================================

  return (

    <div className="cuti-page">

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

      {/* ================= HEADER ================= */}

      <div className="page-header">

        <div>

          <h1>Pengajuan Cuti</h1>

          <p>

            Pengajuan cuti pegawai secara elektronik
            melalui Jendela Layanan Internal BMBPSDM.

          </p>

        </div>

      </div>

      {submitted ? (
        <div className="tracking-card">

  <h2>Status Pengajuan Cuti</h2>

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
            status === "Menunggu"
              ? "Menunggu verifikasi admin"
              : status === "Diproses"
              ? "Sedang diverifikasi"
              : "Verifikasi selesai"
          }
        </p>

      </div>

    </div>

    <div
      className={`timeline-item ${
        status === "Menunggu"
          ? "current"
          : status === "Diproses" || status === "Selesai"
          ? "completed"
          : "pending"
      }`}
    >

      <div className="timeline-dot"></div>

      <div className="timeline-content">

        <h4>Sedang Diproses</h4>

        <span>
          {
            status === "Menunggu"
              ? "Menunggu verifikasi admin"
              : "Sedang diproses admin"
          }
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
          {
            status === "Selesai"
              ? "Permohonan telah selesai"
              : "Menunggu penyelesaian"
          }
        </span>

      </div>

    </div>

  </div>

</div>

) : step === 1 ? (

      <>

      {/* ================= PANDUAN ================= */}

      <div className="guide-card">

        <h2>Panduan Pengajuan</h2>

        <ol className="guide-list">

          <li>Isi data pegawai.</li>

          <li>Masukkan NIP.</li>

          <li>Data pegawai akan terisi otomatis.</li>

          <li>Pilih Status Kepegawaian.</li>

          <li>Pilih Jenis Cuti.</li>

          <li>Lengkapi seluruh data.</li>

          <li>Upload Surat Permohonan.</li>

          <li>Masukkan Link Google Drive.</li>

          <li>Klik Ajukan Permohonan.</li>

        </ol>

      </div>

      {/* ================= DATA PEGAWAI ================= */}

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

            <label>Nama Pegawai *</label>

            <input

              type="text"

              value={nama}

              readOnly

            />

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

            <label>Unit Kerja *</label>

            <input

              type="text"

              value={unitKerja}

              readOnly

            />

          </div>

          <div className="form-group full-width">

            <label>Status Kepegawaian *</label>

            <select

              value={statusKepegawaian}

              onChange={(e)=>{

                setStatusKepegawaian(e.target.value);

                setJenisCuti("");

              }}

            >

              <option value="" disabled hidden>

                Pilih Status Kepegawaian

              </option>

              <option value="PNS">

                PNS

              </option>

              <option value="PPPK">

                PPPK

              </option>

            </select>

          </div>

        </div>

      </div>
            {/* ================= DETAIL CUTI ================= */}

      <div className="form-card">

        <h2>Detail Cuti</h2>

        <div className="form-grid">

          {/* Jenis Cuti */}

          <div className="form-group full-width">

            <label>Jenis Cuti *</label>

            <select
              value={jenisCuti}
              onChange={(e) => setJenisCuti(e.target.value)}
              disabled={!statusKepegawaian}
            >

              <option value="" disabled hidden>

                {
                  statusKepegawaian
                    ? "Pilih Jenis Cuti"
                    : "Pilih Status Kepegawaian terlebih dahulu"
                }

              </option>

              {
                statusKepegawaian &&
                jenisCutiOptions[statusKepegawaian].map((item) => (

                  <option
                    key={item}
                    value={item}
                  >

                    {item}

                  </option>

                ))
              }

            </select>

          </div>


          {/* Alasan */}

          <div className="form-group full-width">

            <label>Alasan Cuti *</label>

            <textarea

              rows="4"

              value={alasanCuti}

              onChange={(e)=>

                setAlasanCuti(e.target.value)

              }

            />

          </div>


          {/* Tanggal Mulai */}

          <div className="form-group">

            <label>Tanggal Mulai *</label>

            <input

              type="date"

              value={tanggalMulai}

              onChange={(e)=>

                setTanggalMulai(e.target.value)

              }

            />

          </div>


          {/* Tanggal Selesai */}

          <div className="form-group">

            <label>Tanggal Selesai *</label>

            <input

              type="date"

              value={tanggalSelesai}

              onChange={(e)=>

                setTanggalSelesai(e.target.value)

              }

            />

          </div>


          {/* Durasi */}

<div className="form-group">

    <label>Total Hari</label>

    <input
        type="number"
        value={durasi}
        readOnly
    />

</div>

<div className="form-group">

    <label>Lama Cuti</label>

    <input
        type="number"
        value={lamaCuti}
        readOnly
    />

</div>

<div className="form-group">

    <label>Satuan</label>

    <input
        type="text"
        value={satuanCuti}
        readOnly
    />

</div>

<div className="form-group">

    <label>Sisa Cuti Tahunan</label>

    <input
        type="text"
        value={sisaCuti}
        readOnly
    />

</div>


          {/* Alamat */}

          <div className="form-group full-width">

            <label>

              Alamat Selama Menjalankan Cuti *

            </label>

            <textarea

              rows="4"

              value={alamatCuti}

              onChange={(e)=>

                setAlamatCuti(e.target.value)

              }

            />

          </div>


          {/* Nomor HP */}

          <div className="form-group">

            <label>No. HP *</label>

            <input

              type="text"

              placeholder="08xxxxxxxxxx"

              value={noHp}

              onChange={(e)=>

                setNoHp(e.target.value)

              }

            />

          </div>

        </div>

      </div>

      {/* ================= DOKUMEN PENDUKUNG ================= */}

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

            onChange={(e)=>

              setLinkDrive(e.target.value)

            }

          />

        </div>

        <div className="drive-note">

          <strong>Catatan</strong>

          <br /><br />

          Upload seluruh dokumen pendukung
          ke dalam satu folder Google Drive.

          <br /><br />

          Pastikan akses folder adalah

          <strong>

            {" "}

            "Siapa saja yang memiliki link dapat melihat"

          </strong>

        </div>

      </div>



      {/* ================= PERNYATAAN ================= */}

      <div className="form-card">

        <label className="checkbox-wrapper">

          <input type="checkbox" required />

          <span>

            Saya menyatakan bahwa seluruh data
            dan dokumen yang saya unggah adalah
            benar dan dapat dipertanggungjawabkan.

          </span>

        </label>

      </div>



      {/* ================= BUTTON ================= */}

      <div className="cuti-actions">

        <button
    className="submit-btn"
    onClick={() => setStep(2)}
>
    Selanjutnya
</button>

      </div>

      </>
      ) : (

<div className="form-card">

<h2>Konfirmasi Pengajuan</h2>

<p>
Silakan download surat, tanda tangani, upload kembali, lalu klik Ajukan Permohonan.
</p>

<button
    className="download-btn"
    onClick={handleDownloadSurat}
>
    Download Surat
</button>

<br /><br />

<div className="upload-area">

<input
    id="uploadSurat"
    type="file"
    accept=".pdf"
    style={{ display: "none" }}
    onChange={(e) => setSuratPermohonan(e.target.files[0])}
/>

<label htmlFor="uploadSurat" className="upload-btn">
    Upload Surat Permohonan
</label>

{suratPermohonan && (
    <p style={{ marginTop: "10px" }}>
        📄 {suratPermohonan.name}
    </p>
)}

</div>

<br />

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

export default Cuti;