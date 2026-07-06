$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir
python -m http.server 5173 --bind 0.0.0.0
