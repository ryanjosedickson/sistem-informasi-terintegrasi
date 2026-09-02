<?php

namespace App\Controllers;

use App\Models\HariLiburModel;

class HariLiburController extends BaseController
{
    protected $hariLiburModel;

    public function __construct()
    {
        $this->hariLiburModel = new HariLiburModel();
    }

    // GET /api/hari-libur
    public function index()
    {
        $data = $this->hariLiburModel
            ->orderBy('tanggal', 'ASC')
            ->findAll();

        return $this->response->setJSON([
            'status' => true,
            'data' => $data
        ]);
    }

    // POST /api/hari-libur
    public function create()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['tanggal']) || empty($data['keterangan']) || empty($data['jenis'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Tanggal, nama hari libur, dan jenis wajib diisi.'
            ]);
        }

        $duplikat = $this->hariLiburModel
            ->where('tanggal', $data['tanggal'])
            ->first();

        if ($duplikat) {
            return $this->response->setStatusCode(409)->setJSON([
                'status' => false,
                'message' => 'Tanggal ini sudah terdaftar sebagai hari libur.'
            ]);
        }

        $this->hariLiburModel->insert([
            'tanggal'    => $data['tanggal'],
            'keterangan' => $data['keterangan'],
            'jenis'      => $data['jenis'],
        ]);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Hari libur berhasil ditambahkan.'
        ]);
    }

    // PUT /api/hari-libur/{id}
    public function update($id)
    {
        $data = $this->request->getJSON(true);

        $existing = $this->hariLiburModel->find($id);

        if (!$existing) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Data hari libur tidak ditemukan.'
            ]);
        }

        if (empty($data['tanggal']) || empty($data['keterangan']) || empty($data['jenis'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status'  => false,
                'message' => 'Tanggal, nama hari libur, dan jenis wajib diisi.'
            ]);
        }

        // Cek duplikat tanggal, kecualikan baris yang sedang diedit
        $duplikat = $this->hariLiburModel
            ->where('tanggal', $data['tanggal'])
            ->where('id !=', $id)
            ->first();

        if ($duplikat) {
            return $this->response->setStatusCode(409)->setJSON([
                'status'  => false,
                'message' => 'Tanggal ini sudah dipakai oleh data hari libur lain.'
            ]);
        }

        $this->hariLiburModel->update($id, [
            'tanggal'    => $data['tanggal'],
            'keterangan' => $data['keterangan'],
            'jenis'      => $data['jenis'],
        ]);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Hari libur berhasil diperbarui.'
        ]);
    }

    // DELETE /api/hari-libur/{id}
    public function delete($id)
    {
        $existing = $this->hariLiburModel->find($id);

        if (!$existing) {
            return $this->response->setStatusCode(404)->setJSON([
                'status'  => false,
                'message' => 'Data hari libur tidak ditemukan.'
            ]);
        }

        $this->hariLiburModel->delete($id);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Hari libur berhasil dihapus.'
        ]);
    }
}
