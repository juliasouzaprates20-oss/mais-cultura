# Robust PowerShell Static HTTP Server for +Cultura
$port = 8080
$prefix = "http://localhost:$port/"
$baseDir = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Output "+Cultura server running at $prefix"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $rawPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrEmpty($rawPath)) {
                $rawPath = "index.html"
            }
            
            $decodedPath = [System.Uri]::UnescapeDataString($rawPath).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $baseDir $decodedPath
            
            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".svg"  { "image/svg+xml" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".webp" { "image/webp" }
                    default { "application/octet-stream" }
                }
                
                $response.ContentType = $contentType
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $decodedPath")
                $response.ContentLength64 = $msg.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($msg, 0, $msg.Length)
                }
            }
        } catch {
            $response.StatusCode = 500
        } finally {
            try { $response.OutputStream.Close() } catch {}
            try { $response.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
}
