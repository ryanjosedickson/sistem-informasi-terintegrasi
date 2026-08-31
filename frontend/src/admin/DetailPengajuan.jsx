import "./DetailPengajuan.css";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function DetailPengajuan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [suratRespon, setSuratRespon] = useState(null);

  const [data, setData] = useState(location.state);

  const [status, setStatus] = useState(
    data?.status || "Menunggu"
  );

  const [catatanAdmin, setCatatanAdmin] =
    useState("");

  useEffect(() => {

    if (!data?.id) return;

    const loadData = async () => {

      try {

        // ambil data pengajuan
        const resPengajuan = await fetch(
          `http://localhost:8080/api/pengajuan/detail/${data.id}`
        );

        const pengajuan = await resPengajuan.json();

        // ambil data pegawai (hanya jika NIP tersedia)
        let pegawai = {};

        if (pengajuan?.nip) {
          const resPegawai = await fetch(
            `http://localhost:8080/api/pegawai/${pengajuan.nip}`
          );
          pegawai = await resPegawai.json();
        }

        setData({
          ...pengajuan,

          unit_kerja:
            pengajuan.unit_kerja ||
            pegawai.unit_organisasi ||
            "-",

          jabatan:
            pengajuan.jabatan ||
            pegawai.jabatan,

        });

      } catch (err) {

        console.error(err);

      }

    };

    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);

  }, [data?.id]);

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setCatatanAdmin(data.catatan_admin || "");
    }
  }, [data]);

  const updateStatus = async (
    statusBaru,
    catatan = ""
  ) => {

    const formData = new FormData();

    formData.append(
      "status",
      statusBaru
    );

    formData.append(
      "catatan_admin",
      catatan
    );

    if (suratRespon) {

      formData.append(
        "file_respon",
        suratRespon
      );

    }

    const response = await fetch(

      `http://localhost:8080/api/pengajuan/${data.id}`,

      {

        method: "POST",

        body: formData

      }

    );

    const result = await response.json();

    if (!result.success) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: result.error || result.message,
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    setStatus(statusBaru);
    setCatatanAdmin(catatan);

    const res = await fetch(
      `http://localhost:8080/api/pengajuan/detail/${data.id}`
    );

    const terbaru = await res.json();

    setData(terbaru);

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Status pengajuan berhasil diperbarui.",
      confirmButtonColor: "#2563eb",
    });

  };

  if (!data) {
    return (
      <div className="detail-page">

        <div className="detail-card">

          <h2>
            Data pengajuan tidak ditemukan
          </h2>

          <button
            className="back-btn"
          >
            <img
              src="/logo-back.png"
              alt="Back"
              className="back-icon"
            />
          </button>

        </div>

      </div>
    );
  }

  const handleApprove = async () => {

    if (!suratRespon && !data.file_respon) {
      Swal.fire({
        icon: "warning",
        title: "Surat Belum Diunggah",
        text: "Silakan upload Surat Balasan Admin terlebih dahulu.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    await updateStatus(
      "Selesai",
      catatanAdmin
    );

  };


  const handleProcess = async () => {

    await updateStatus(
      "Diproses",
      catatanAdmin
    );

  };

  const handleReject = async () => {

    const result = await Swal.fire({
      title: "Tolak Pengajuan?",
      text: "Status pengajuan akan diubah menjadi Ditolak.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      await updateStatus(
        "Ditolak",
        catatanAdmin
      );
    }

  };

  return (
    <div className="detail-page">

      <div className="detail-card">

        {/* HEADER */}

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Kembali
        </button>

        <div className="detail-header">

          <div className="header-content">

            <div className="profile-section">

              <div className="avatar-circle">
                {data.nama?.charAt(0)}
              </div>

              <div className="header-info">

                <h1>Detail Pengajuan</h1>

                <h2>{data.nama}</h2>

                <p>
                  {data.unit_kerja || "-"} • {data.tanggal_pengajuan || "-"}
                </p>

              </div>

            </div>

            <div className="status-section">

              <span
                className={`status-badge ${
                  status === "Menunggu"
                    ? "pending"
                    : status === "Diproses"
                    ? "process"
                    : status === "Selesai"
                    ? "approved"
                    : "rejected"
                }`}
              >
                {status}
              </span>

            </div>

          </div>

        </div>

        {/* TIMELINE */}
        <div className="detail-section">

          <h3>Status Pengajuan</h3>

          <div className="timeline">

            <div className="timeline-item">
              <div className="timeline-dot"></div>

              <div className="timeline-content">
                <h4>Pengajuan Dikirim</h4>
                <p>
                  Pengajuan telah masuk ke sistem.
                </p>
              </div>
            </div>

            {(status === "Diproses" ||
              status === "Selesai") && (
              <div className="timeline-item">
                <div className="timeline-dot"></div>

                <div className="timeline-content">
                  <h4>Diproses Admin</h4>
                  <p>
                    Pengajuan sedang diverifikasi.
                  </p>
                </div>
              </div>
            )}

            {status === "Selesai" && (
              <div className="timeline-item">
                <div className="timeline-dot"></div>

                <div className="timeline-content">
                  <h4>Selesai</h4>
                  <p>
                    Pengajuan telah Selesai.
                  </p>
                </div>
              </div>
            )}

            {status === "Ditolak" && (
              <div className="timeline-item">
                <div
                  className="timeline-dot"
                  style={{
                    background: "#dc2626",
                  }}
                ></div>

                <div className="timeline-content">
                  <h4>Ditolak</h4>
                  <p>
                    Pengajuan ditolak oleh admin.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        <div className="detail-section">

          <h3>Catatan Admin</h3>

          <textarea
            rows="5"
            value={catatanAdmin}
            onChange={(e) =>
              setCatatanAdmin(e.target.value)
            }
            placeholder="Tulis catatan..."
          ></textarea>

        </div>

        {/* DATA PEGAWAI */}
        <div className="detail-section">

          <h3>Data Pegawai</h3>

          <div className="detail-grid">

            <div>
              <label>Nama Pegawai</label>
              <p>{data.nama}</p>
            </div>

            <div>
              <label>NIP</label>
              <p>
                {data.nip || "-"}
              </p>
            </div>

            <div>
              <label>Unit Kerja</label>
              <p>
                {data.unit_kerja || "-"}
              </p>
            </div>

            <div>
              <label>Jabatan</label>
              <p>
                {data.jabatan || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* PENGAJUAN */}
        <div className="detail-section">

          <h3>Informasi Pengajuan</h3>

          <div className="detail-grid">

            <div>
              <div>
                <label>Jenis Layanan</label>
                <p>
                  {data.sub_layanan || data.layanan}
                </p>
              </div>
            </div>

            <div>
              <label>Tanggal Pengajuan</label>
              <p>
                {data.tanggal_pengajuan
                  ? new Date(data.tanggal_pengajuan).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>


          </div>

        </div>

        {/* DOKUMEN */}
        <div className="detail-section">

          <h3>Surat Permohonan</h3>

          {
            data.surat_permohonan ? (

              <div className="document-card">

                <div className="document-info">

                  <div>

                    <h4>Surat Permohonan</h4>

                    <p>
                      File yang diunggah oleh pemohon
                    </p>

                  </div>

                </div>

                <div className="document-actions">

                  <a
                    href={`http://localhost:8080/${data.surat_permohonan}`}
                    target="_blank"
                    rel="noreferrer"
                    className="view-doc-btn"
                  >
                    👁 Lihat
                  </a>

                  <a
                    href={`http://localhost:8080/${data.surat_permohonan}`}
                    download
                    className="download-doc-btn"
                  >
                    ⬇ Download
                  </a>

                </div>

              </div>

            ) : (

              <p>Tidak ada surat permohonan.</p>

            )
          }

        </div>

        <div className="detail-section">

          <h3>Dokumen Pendukung</h3>

          {
            data.link_drive ? (

              <a

                href={data.link_drive}

                target="_blank"

                rel="noreferrer"

                className="drive-button"

              >

                Folder Google Drive

              </a>

            ) : (

              <p>
                Tidak ada link Google Drive.
              </p>

            )

          }

        </div>

        {/* CATATAN ADMIN */}
        {catatanAdmin && (
          <div className="detail-section">

            <h3>Catatan Admin</h3>

            <div className="admin-note">
              {catatanAdmin}
            </div>

          </div>
        )}

        <div className="response-upload">

          <h3>Surat Balasan Admin</h3>

          {data.file_respon ? (

            <>
              <p className="response-name">
                ✅ {data.file_respon.split("/").pop()}
              </p>

              <div className="document-actions">

                <a
                  href={`http://localhost:8080/${data.file_respon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="view-doc-btn"
                >
                  👁 Lihat
                </a>

                <a
                  href={`http://localhost:8080/${data.file_respon}`}
                  download
                  className="download-doc-btn"
                >
                  ⬇ Download
                </a>

              </div>
            </>

          ) : (

            <>
              <label className="upload-response">

                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e) => setSuratRespon(e.target.files[0])}
                />

                Upload Surat Balasan

              </label>

              {suratRespon && (
                <p className="response-name">
                  ✅ {suratRespon.name}
                </p>
              )}
            </>

          )}

        </div>

        {/* AKSI */}
        <div className="action-buttons">

          <button
            className="reject-btn"
            onClick={handleReject}
            disabled={status === "Ditolak"}
          >
            Tolak
          </button>

          <button
            className="process-btn"
            onClick={handleProcess}
            disabled={status === "Diproses"}
          >
            Proses
          </button>

          <button
            className="approve-btn"
            onClick={handleApprove}
            disabled={status === "Selesai"}
          >
            Selesai
          </button>

        </div>

      </div>

    </div>
  );
}
