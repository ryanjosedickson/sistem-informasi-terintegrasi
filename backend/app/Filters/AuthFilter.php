<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $session = session();

        if (!$session->get('isLoggedIn')) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON([
                    'status' => false,
                    'message' => 'Anda harus login terlebih dahulu'
                ]);
        }

        // Kalau ada argumen role yang di-pass dari route, cek juga role-nya
        // contoh pemakaian: 'filter' => 'auth:admin_kepegawaian'
        if ($arguments && !in_array($session->get('role'), $arguments)) {
            return service('response')
                ->setStatusCode(403)
                ->setJSON([
                    'status' => false,
                    'message' => 'Anda tidak memiliki akses ke resource ini'
                ]);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Tidak perlu apa-apa di sini
    }
}