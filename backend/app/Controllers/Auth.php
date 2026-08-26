<?php

namespace App\Controllers;

use App\Models\PegawaiModel;
use App\Models\UserModel;
// use App\Models\AdminModel;

class Auth extends BaseController
{
    public function register()
    {
        $model = new UserModel();
        $data = $this->request->getJSON(true);

        $user = [
            'nama'     => $data['nama'],
            'nip'      => $data['nip'],
            'email'    => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role'     => $data['role'] ?? 'pegawai'
        ];

        $model->insert($user);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'User berhasil dibuat'
]);
    }

    public function login()
    {
        // Izinkan CORS untuk request dari React
        $this->response->setHeader('Access-Control-Allow-Origin', '*');
        $this->response->setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        $this->response->setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle preflight OPTIONS request
        if ($this->request->getMethod() === 'options') {
            return $this->response->setStatusCode(200);
        }

        $data = $this->request->getJSON(true);

        // Validasi input
        if (empty($data['nip']) || empty($data['password'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'NIP dan Password wajib diisi'
            ]);
        }

        $model = new UserModel();

// *Filter role = pegawai, supaya form Login Pegawai tidak bisa dipakai untuk login sebagai admin
$user = $model->where('nip', $data['nip'])->where('role', 'pegawai')->first();

if (!$user) {
    return $this->response->setStatusCode(401)->setJSON([
        'status' => false,
        'message' => 'NIP tidak ditemukan'
    ]);
}

if (!password_verify($data['password'], $user['password'])) {
    return $this->response->setStatusCode(401)->setJSON([
        'status' => false,
        'message' => 'Password salah'
    ]);
}

        // === PERBAIKAN DI SINI: 'nama' bukan 'nama_lengkap' ===
$sessionData = [
    'nip'        => $user['nip'],
    'nama'       => $user['nama'],
    'role'       => 'pegawai',
    'isLoggedIn' => true
];
        session()->set($sessionData);

        unset($user['password']);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Login berhasil',
            'user' => $user
        ]);

    }

public function loginAdmin()
{
    $this->response->setHeader('Access-Control-Allow-Origin', '*');
    $this->response->setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    $this->response->setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if ($this->request->getMethod() === 'options') {
        return $this->response->setStatusCode(200);
    }

    $data = $this->request->getJSON(true);

    if (empty($data['username']) || empty($data['password'])) {
        return $this->response->setStatusCode(400)->setJSON([
            'status' => false,
            'message' => 'Username dan Password wajib diisi'
        ]);
    }

    $model = new UserModel();

    // Frontend mengirim field "username", tapi kolom di DB cuma "email"
    // (lihat catatan di bawah)
    $admin = $model->where('email', $data['username'])
                    ->whereIn('role', ['admin_kepegawaian', 'admin_bmn', 'admin_humas'])
                    ->first();

    if (!$admin) {
        return $this->response->setStatusCode(401)->setJSON([
            'status' => false,
            'message' => 'Username tidak ditemukan'
        ]);
    }

    if (!password_verify($data['password'], $admin['password'])) {
        return $this->response->setStatusCode(401)->setJSON([
            'status' => false,
            'message' => 'Password salah'
        ]);
    }

    session()->set([
        'nip'        => $admin['nip'],
        'nama'       => $admin['nama'],
        'role'       => $admin['role'],
        'isLoggedIn' => true
    ]);

    unset($admin['password']);

    // Response ini yang dipakai frontend untuk isi localStorage
    // dan validasi expectedRole vs selectedRole
    return $this->response->setJSON([
        'status' => true,
        'message' => 'Login berhasil',
        'user' => $admin   // { id, nip, nama, email, role, ... }
    ]);
}

    public function gantiPassword()
    {
        $this->response->setHeader('Access-Control-Allow-Origin', '*');
        
        $model = new UserModel();
        $data = $this->request->getJSON(true);

        $nip = $data["nip"] ?? '';
        $passwordLama = $data["passwordLama"] ?? '';
        $passwordBaru = $data["passwordBaru"] ?? '';

        $user = $model->where("nip", $nip)->first();

        if (!$user) {
            return $this->response->setJSON(["status" => false, "message" => "User tidak ditemukan."]);
        }

        if (!password_verify($passwordLama, $user["password"])) {
            return $this->response->setJSON(["status" => false, "message" => "Password lama salah."]);
        }

        $model->update($user["id"], [
            "password" => password_hash($passwordBaru, PASSWORD_DEFAULT)
        ]);

        return $this->response->setJSON(["status" => true, "message" => "Password berhasil diganti."]);
    }
public function initPasswordPegawai()
    {
        $userModel = new UserModel();

        $pegawaiUsers = $userModel->where('role', 'pegawai')->findAll();

        foreach ($pegawaiUsers as $u) {
            $userModel->update($u['id'], [
                'password' => password_hash($u['nip'], PASSWORD_DEFAULT)
            ]);
        }

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Password seluruh pegawai berhasil diinisialisasi.'
        ]);
    }
}