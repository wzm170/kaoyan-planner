$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

Write-Host "Starting local website at http://127.0.0.1:5173"
$server = Start-Process -FilePath python -ArgumentList @("-m", "http.server", "5173", "--bind", "0.0.0.0") -WorkingDirectory $ProjectDir -WindowStyle Hidden -PassThru

Write-Host "Starting public tunnel. Keep this window open."
Write-Host "If another server is already using port 5173, close it first."
try {
  npx --yes localtunnel --port 5173 --local-host 127.0.0.1
}
finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id
  }
}
