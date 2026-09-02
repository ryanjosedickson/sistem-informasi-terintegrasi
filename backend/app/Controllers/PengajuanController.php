<?php

namespace App\Controllers;

use App\Models\PengajuanModel;
use App\Models\NotifikasiModel;

class PengajuanController extends BaseController
{
    protected $pengajuanModel;
    protected $notifikasiModel;

    public function __construct()
    {
        $this->pengajuanModel = new PengajuanModel();
        $this->notifikasiModel = new NotifikasiModel();
    }
public function detail($id)
{
    log_message("debug","DETAIL ID = ".$id);

    $data = $this->pengajuanModel->find($id);

    log_message("debug",json_encode($data));

    return $this->response->setJSON($data);
}

    // Menampilkan seluruh pengajuan
public function index()
{
    $data = $this->pengajuanModel
        ->orderBy("id", "DESC")
        ->findAll();

    foreach ($data as &$item) {

        // hanya untuk layanan cuti
        if ($item["layanan"] == "Cuti") {

            $tahun = date("Y");

$tahun = date("Y");

$awalTahun = $tahun . "-01-01";
$akhirTahun = $tahun . "-12-31";

$hasil = $this->pengajuanModel
    ->selectSum("durasi")
    ->where("nip", $item["nip"])
    ->where("jenis_cuti", "Cuti Tahunan")
    ->whereIn("status", [
        "Disetujui",
        "Selesai"
    ])
    ->where("tanggal_mulai >=", $awalTahun)
    ->where("tanggal_mulai <=", $akhirTahun)
    ->first();
            $terpakai = (int)($hasil["durasi"] ?? 0);

            $item["sisa_cuti"] = max(
                0,
                12 - $terpakai
            );
        }

    }

    return $this->response->setJSON($data);
}


    // Membuat pengajuan baru
public function create()
{
    try {

        $data = $this->request->getPost();
        $durasi = 0;

if (
    !empty($data["tanggal_mulai"]) &&
    !empty($data["tanggal_selesai"])
) {
    $durasi = $this->hitungHariKerja(
        $data["tanggal_mulai"],
        $data["tanggal_selesai"]
    );
}

log_message("error", "DATA POST:");
log_message("error", json_encode($data));

        $file = $this->request->getFile("suratPermohonan");

        $filePath = "";

        if ($file && $file->isValid() && !$file->hasMoved()) {

            $namaBaru = $file->getRandomName();

            $file->move(
                FCPATH . "uploads/permohonan",
                $namaBaru
            );

            $filePath = "uploads/permohonan/" . $namaBaru;
        }

        log_message(
    'error',
    'LINK DRIVE = ' .
    $this->request->getVar('linkDrive')
);

log_message(
    'error',
    'UNIT KERJA = ' .
    $this->request->getVar('unit_kerja')
);
if (($data["jenis_cuti"] ?? "") == "Cuti Tahunan") {

    $tahun = date("Y");

    $awal = "$tahun-01-01";
    $akhir = "$tahun-12-31";

    $hasil = $this->pengajuanModel
        ->selectSum("durasi")
        ->where("nip", $data["nip"])
        ->where("jenis_cuti", "Cuti Tahunan")
        ->whereIn("status", [
            "Disetujui",
            "Selesai"
        ])
        ->where("tanggal_mulai >=", $awal)
        ->where("tanggal_mulai <=", $akhir)
        ->first();

    $terpakai = (int)($hasil["durasi"] ?? 0);

    if ($terpakai + $durasi > 12) {

        return $this->response
            ->setJSON([
                "success" => false,
                "message" =>
                    "Sisa cuti tahunan tidak mencukupi."
            ]);

    }

}

        $insertData = [

    'nip' => $data['nip'] ?? '',

    'nama' => $data['nama'] ?? '',

    'jabatan' => $data['jabatan'] ?? '',

    'unit_kerja' => $data['unit_kerja'] ?? '',

'layanan' => $data['layanan'] ?? '',

'sub_layanan' => $data['subLayanan'] ?? '',

    'status_kepegawaian' => $data['status_kepegawaian'] ?? '',

    'jenis_cuti' => $data['jenis_cuti'] ?? '',

    'alasan_cuti' => $data['alasan_cuti'] ?? '',

    'tanggal_mulai' => $data['tanggal_mulai'] ?? null,

    'tanggal_selesai' => $data['tanggal_selesai'] ?? null,

    'durasi' => $durasi,

    'lama_cuti' => $data['lama_cuti'] ?? 0,

    'satuan_cuti' => $data['satuan_cuti'] ?? '',

    'alamat_cuti' => $data['alamat_cuti'] ?? '',        

    'no_hp' => $data['no_hp'] ?? '',

    'status' => 'Menunggu',

    'tanggal_pengajuan' => date("Y-m-d H:i:s"),

    'surat_permohonan' => $filePath,

'link_drive' => $data['link_drive'] ?? '',

];
log_message('error', json_encode($insertData));

log_message('debug', json_encode($insertData));

        $this->pengajuanModel->insert($insertData);

$id = $this->pengajuanModel->insertID();

return $this->response->setJSON([
    "success" => true,
    "message" => "Pengajuan berhasil dikirim",
    "id" => $id
]);

        return $this->response->setJSON([
            "success" => true,
            "message" => "Pengajuan berhasil dikirim"
        ]);

    } catch (\Throwable $e) {

        return $this->response
            ->setStatusCode(500)
            ->setJSON([
                "success" => false,
                "error" => $e->getMessage(),
                "line" => $e->getLine()
            ]);
    }
}

    // Update status pengajuan oleh admin
public function updateStatus($id)
{
    try {

        // Ambil data FormData
        $status = $this->request->getPost('status');
        $catatan = $this->request->getPost('catatan_admin');
        log_message("error","STATUS DITERIMA = ".$status);
        log_message(
    "error",
    json_encode([
        "id"=>$id,
        "status"=>$status,
        "catatan"=>$catatan
    ])
);

        // Cari data pengajuan
        $pengajuan = $this->pengajuanModel->find($id);

        if (!$pengajuan) {
            return $this->response
                ->setStatusCode(404)
                ->setJSON([
                    'success' => false,
                    'message' => 'Data pengajuan tidak ditemukan.'
                ]);
        }

        // Upload file PDF
        $filePath = $pengajuan['file_respon'] ?? null;

        $file = $this->request->getFile("file_respon");

if($file && $file->isValid()){

    $namaBaru = $file->getRandomName();

    $file->move(
        FCPATH."uploads/respon",
        $namaBaru
    );

    $filePath = "uploads/respon/".$namaBaru;

}

        // Update database
$update = $this->pengajuanModel->update($id,[

    'status'=>$status,

    'catatan_admin'=>$catatan,

    'file_respon'=>$filePath

]);
$dataUpdate = [
    'status' => $status,
    'catatan_admin' => $catatan,
    'file_respon' => $filePath
];

log_message("error", "UPDATE DATA = " . json_encode($dataUpdate));

log_message(
    "error",
    "HASIL UPDATE = " .
    ($this->pengajuanModel->db->affectedRows())
);

log_message(
    'debug',
    'UPDATE='.json_encode($update)
);

$dataBaru = $this->pengajuanModel->find($id);

log_message(
    'debug',
    json_encode($dataBaru)
);

        // Simpan notifikasi
       $this->notifikasiModel->insert([

    "nip" => $pengajuan["nip"],

    "layanan" => $pengajuan["layanan"],

    "judul" => "Status Pengajuan",

    "pesan" => "Pengajuan {$pengajuan["layanan"]} sekarang berstatus {$status}",

    "status" => "unread",

    "pengajuan_id" => $id

]);
        return $this->response->setJSON([

            'success' => true,

            'message' => 'Pengajuan berhasil diperbarui.'

        ]);

    } catch (\Throwable $e) {

        return $this->response
            ->setStatusCode(500)
            ->setJSON([

                'success' => false,

                'error' => $e->getMessage(),

                'line' => $e->getLine()

            ]);
    }
    
}

public function getSisaCuti($nip)
{
    $tahun = date("Y");

    $awal = "$tahun-01-01";
    $akhir = "$tahun-12-31";

    $hasil = $this->pengajuanModel
        ->selectSum("durasi")
        ->where("nip", $nip)
        ->where("jenis_cuti", "Cuti Tahunan")
        ->whereIn("status", [
            "Disetujui",
            "Selesai"
        ])
        ->where("tanggal_mulai >=", $awal)
        ->where("tanggal_mulai <=", $akhir)
        ->first();

    $terpakai = (int)($hasil["durasi"] ?? 0);

    return $this->response->setJSON([
        "hak" => 12,
        "terpakai" => $terpakai,
        "sisa" => max(0, 12 - $terpakai)
    ]);
}

private function hitungHariKerja($mulai, $selesai)
{
    $start = new \DateTime($mulai);
    $end = new \DateTime($selesai);

    $end->modify("+1 day");

    $interval = new \DateInterval("P1D");
    $periode = new \DatePeriod($start, $interval, $end);

    // Ambil semua tanggal hari libur (libur nasional + cuti bersama)
    // yang jatuh di rentang tanggal pengajuan, supaya tidak ikut
    // memotong jatah cuti tahunan
    $db = \Config\Database::connect();
    $liburRows = $db->table('hari_libur')
        ->select('tanggal')
        ->where('tanggal >=', $mulai)
        ->where('tanggal <=', $selesai)
        ->get()
        ->getResultArray();

    $tanggalLibur = array_column($liburRows, 'tanggal');

    $hariKerja = 0;

    foreach ($periode as $tanggal) {

        $hari = $tanggal->format("N");
        $tanggalStr = $tanggal->format("Y-m-d");

        // Senin=1 ... Jumat=5, DAN bukan tanggal yang ada di hari_libur
        if ($hari <= 5 && !in_array($tanggalStr, $tanggalLibur, true)) {
            $hariKerja++;
        }

    }

    return $hariKerja;
}
}