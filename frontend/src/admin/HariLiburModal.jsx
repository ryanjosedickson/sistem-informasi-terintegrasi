import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./HariLiburModal.css";

const API_URL = "http://localhost:8080";

const JENIS_LABEL = {
  libur_nasional: "Libur Nasional",
  cuti_bersama: "Cuti Bersama",
};

export default function HariLiburModal({ onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterTahun, setFilterTahun] = useState("");

  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [jenis, setJenis] = useState("libur_nasional");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/hari-libur`);
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setTanggal("");
    setKeterangan("");
    setJenis("libur_nasional");
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (row) => {
    setTanggal(row.tanggal);
    setKeterangan(row.keterangan);
    setJenis(row.jenis);
    setEditingId(row.id);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!tanggal || !keterangan || !jenis) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Tanggal, nama hari libur, dan jenis wajib diisi.",
      });
      return;
    }

    const isEdit = editingId !== null;

    try {
      const res = await fetch(
        `${API_URL}/api/hari-libur${isEdit ? `/${editingId}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tanggal, keterangan, jenis }),
        }
      );

      const result = await res.json();

      if (!result.status) {
        // Termasuk kasus duplikat tanggal (409) dari backend
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message,
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: result.message,
        timer: 1500,
        showConfirmButton: false,
      });

      setShowForm(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal terhubung ke server",
        text: "Pastikan backend berjalan.",
      });
    }
  };

  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      title: "Hapus hari libur ini?",
      text: `${row.keterangan} (${row.tanggal})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/hari-libur/${row.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!result.status) {
        Swal.fire({ icon: "error", title: "Gagal", text: result.message });
        return;
      }

      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return "-";
    return new Date(tgl).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Daftar tahun unik dari data yang sudah ada, untuk isi dropdown filter
  const availableYears = [
    ...new Set(data.map((row) => row.tanggal?.slice(0, 4)).filter(Boolean)),
  ].sort((a, b) => b - a);

  const filteredData = filterTahun
    ? data.filter((row) => row.tanggal?.startsWith(filterTahun))
    : data;

  return (
    <div className="hariliburmodal-backdrop" onClick={onClose}>
      <div
        className="hariliburmodal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hariliburmodal-header">
          <h2>Kelola Hari Libur</h2>
          <button className="hariliburmodal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!showForm ? (
          <>
            <div className="hariliburmodal-toolbar">
              <select
                className="hariliburmodal-year-filter"
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((tahun) => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                ))}
              </select>

              <button className="hariliburmodal-add-btn" onClick={openAddForm}>
                + Tambah
              </button>
            </div>

            <div className="hariliburmodal-table-wrapper">
              {loading ? (
                <p className="hariliburmodal-empty">Memuat data...</p>
              ) : filteredData.length === 0 ? (
                <p className="hariliburmodal-empty">
                  {filterTahun
                    ? `Belum ada data hari libur untuk tahun ${filterTahun}.`
                    : "Belum ada data hari libur."}
                </p>
              ) : (
                <table className="hariliburmodal-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Nama Hari Libur</th>
                      <th>Jenis</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row) => (
                      <tr key={row.id}>
                        <td>{formatTanggal(row.tanggal)}</td>
                        <td>{row.keterangan}</td>
                        <td>
                          <span
                            className={`hariliburmodal-badge ${
                              row.jenis === "cuti_bersama"
                                ? "cuti-bersama"
                                : "libur-nasional"
                            }`}
                          >
                            {JENIS_LABEL[row.jenis] || row.jenis}
                          </span>
                        </td>
                        <td className="hariliburmodal-actions">
                          <button
                            className="hariliburmodal-edit-btn"
                            onClick={() => openEditForm(row)}
                          >
                            Edit
                          </button>
                          <button
                            className="hariliburmodal-delete-btn"
                            onClick={() => handleDelete(row)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="hariliburmodal-form">
            <h3>{editingId ? "Edit Hari Libur" : "Tambah Hari Libur"}</h3>

            <div className="hariliburmodal-form-group">
              <label>Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>

            <div className="hariliburmodal-form-group">
              <label>Nama Hari Libur</label>
              <input
                type="text"
                placeholder="Contoh: Hari Raya Natal"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>

            <div className="hariliburmodal-form-group">
              <label>Jenis</label>
              <select value={jenis} onChange={(e) => setJenis(e.target.value)}>
                <option value="libur_nasional">Libur Nasional</option>
                <option value="cuti_bersama">Cuti Bersama</option>
              </select>
            </div>

            <div className="hariliburmodal-form-actions">
              <button
                className="hariliburmodal-cancel-btn"
                onClick={handleCancelForm}
              >
                Batal
              </button>
              <button
                className="hariliburmodal-save-btn"
                onClick={handleSubmit}
              >
                Simpan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
