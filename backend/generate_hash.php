<?php

$nip = $argv[1] ?? null;

if (!$nip) {
    die("Usage: php generate_hash.php <NIP>\n");
}

echo password_hash($nip, PASSWORD_DEFAULT);