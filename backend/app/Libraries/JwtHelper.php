<?php

namespace App\Libraries;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper
{
    private static function getKey(): string
    {
        return getenv('JWT_SECRET_KEY');
    }

    // Generate token saat login berhasil
    public static function generate(array $payload, int $expiresInSeconds = 28800): string
    {
        // default 8 jam, sesuaikan dengan kebutuhan jam kerja
        $issuedAt = time();
        $expire   = $issuedAt + $expiresInSeconds;

        $data = array_merge($payload, [
            'iat' => $issuedAt,
            'exp' => $expire,
        ]);

        return JWT::encode($data, self::getKey(), 'HS256');
    }

    // Validasi & decode token, return null kalau invalid/expired
    public static function validate(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key(self::getKey(), 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}