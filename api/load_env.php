<?php
// load_env.php
// This script loads environment variables from a .env file.

function loadEnv($filePath) {
    // Check if the .env file exists
    if (!file_exists($filePath)) {
        // If not, simply return without an error.
        // For a production environment, you might want to log this.
        return;
    }

    // Read the file content and split it into lines
    $lines = file_get_contents($filePath);
    if ($lines === false) {
        // Failed to read file, return.
        return;
    }
    
    $lines = explode("\n", $lines);

    foreach ($lines as $line) {
        // Trim whitespace from the beginning and end of the line
        $line = trim($line);

        // Skip empty lines and comment lines (starting with #)
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }

        // Split the line into a key-value pair at the first '=' sign
        list($key, $value) = explode('=', $line, 2);
        
        // Trim whitespace and quotes from the key and value
        $key = trim($key);
        $value = trim($value, " \n\r\t\"'");

        // Set the environment variable if it's not already set
        if (!isset($_SERVER[$key]) && !isset($_ENV[$key])) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// Read the .env file from the project root.
// This script is in the 'api/' directory, so it needs to go up one level.
$envPath = __DIR__ . '/../.env'; 
loadEnv($envPath);
?>