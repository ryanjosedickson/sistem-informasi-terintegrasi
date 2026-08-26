<?php

namespace App\Models;

use CodeIgniter\Model;

class PegawaiModel extends Model
{
    protected $table = 'pegawai';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;

    protected $allowedFields = [
        'nama',
        'nip',
        'jabatan',
        'pangkat_golongan',
        'unit_organisasi',
        // 'password' || dihapus — auth pindah sepenuhnya ke UserModel
    ];
}