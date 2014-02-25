<?php
require 'jsmin.php';

function custom_minify($script) {
    // Minify the script
    $script = preg_replace("/[\r\n]/m", "", JSMin::minify($script));

    // Then make it URL-safe
    $blacklist = array(
        0 => '%', 1 => ' ', 2 => '<', 3 => '>'
    );
    $surrogate = array(
        0 => '%25', 1 => '%20', 2 => '%3C', 3 => '%3E'
    );
    ksort($blacklist);
    ksort($surrogate);

    $script = str_replace($blacklist, $surrogate, $script);

    return $script;
}

// Set source file and other properties
$hasher_source = 'password-hasher.js';
$version = '1.7';
$modified = filemtime($hasher_source);

// Use salt and maxlen from the form, or create defaults
$salt = empty($_POST['salt']) ? md5(mt_rand() . time()).md5(mt_rand() . time()) : str_replace('\'', '\\\'', $_POST['salt']);
$limit = min(40, max(5, empty($_POST['limit']) ? 40 : intval($_POST['limit'])));

// Include js source as script source to interpolate salt and maxlen into script variables
ob_start();
include $hasher_source;
$script = ob_get_clean();

// Minify JS
$minified = custom_minify($script);

// Display the results
include 'hasher.html';
