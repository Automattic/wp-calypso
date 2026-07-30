#Requires -Version 5.1
<#
.SYNOPSIS
    Builds the signed WordPress.com desktop Windows NSIS direct-download
    installer on Buildkite.

    Unlike the Store .appx (build-desktop-windows.ps1), this is the
    direct-download path: it is code-signed and keeps the in-app
    electron-updater enabled, so existing users auto-update to it.

    Signs via Azure Artifact Signing by default (AINFRA-2237). The org Sectigo
    PFX is retained as a fallback, selected by setting FORCE_PFX_SIGNING, until
    the Azure-signed build is confirmed in distribution. The signer choice here
    only decides which env vars are populated; electron-builder's `win.sign`
    callback (bin/windows-sign.js) routes on them.
#>

# PowerShell does not abort on a failed *native* command, only on failed cmdlets.
# Stop on cmdlet errors, and check $LASTEXITCODE by hand after each native call.
$ErrorActionPreference = 'Stop'

function Invoke-Checked {
    param([Parameter(Mandatory)][scriptblock]$Command)
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code ${LASTEXITCODE}: $Command"
    }
}

# The a8c Windows AMI ships bun/go/rust/python and the Windows 10 SDK, but no
# Node toolchain - unlike the mac/linux agents, which get Node from the
# `automattic/nvm` Buildkite plugin (a bash plugin that can't run here). So we
# install the `.nvmrc`-pinned Node ourselves.
$NodeVersion = (Get-Content "$PSScriptRoot\..\..\.nvmrc").Trim()
Write-Output "--- :nodejs: Installing Node $NodeVersion"
Invoke-Checked { choco install nodejs --version=$NodeVersion --yes --no-progress }

# Chocolatey updates the machine PATH, not the current session. Prepend the
# install dir directly rather than calling `refreshenv`, which is documented to
# clobber in-session PATH edits (buildkite-ci chocolatey_utils.ps1).
$env:Path = "C:\Program Files\nodejs;$env:Path"
Invoke-Checked { node --version }

Write-Output "--- :yarn: Enabling Corepack"
$env:COREPACK_ENABLE_DOWNLOAD_PROMPT = '0'
Invoke-Checked { corepack enable }

Set-Location "$PSScriptRoot\..\..\desktop"

$env:CONFIG_ENV = 'release'
$env:SKIP_TSC = 'true'
$env:PLAYWRIGHT_SKIP_DOWNLOAD = 'true'
# Note: WINDOWS_STORE is intentionally NOT set, so the in-app updater stays on.

Write-Output "--- :yarn: Installing desktop dependencies"
Invoke-Checked { yarn install --immutable --inline-builds }

if ($env:FORCE_PFX_SIGNING) {
    # Fallback: materialize the org Sectigo cert from AWS Secrets Manager (writes
    # certificate.pfx; WINDOWS_CODE_SIGNING_CERT_PASSWORD is the matching
    # password, already on the windows queue). bin/windows-sign.js signs with
    # signtool /f /p, so locate signtool from the Windows 10 SDK on the AMI.
    Write-Output "--- :lock: Configuring Windows code signing (PFX fallback)"
    Invoke-Checked { & 'setup_windows_code_signing.ps1' }

    if ([string]::IsNullOrEmpty($env:WINDOWS_CODE_SIGNING_CERT_PASSWORD)) {
        throw "WINDOWS_CODE_SIGNING_CERT_PASSWORD is not set on this agent."
    }
    $env:WIN_CSC_LINK = (Convert-Path '.\certificate.pfx')
    $env:WIN_CSC_KEY_PASSWORD = $env:WINDOWS_CODE_SIGNING_CERT_PASSWORD

    $signtool = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\bin' -Recurse -Filter 'signtool.exe' -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match '\\x64\\signtool\.exe$' } |
        Sort-Object FullName | Select-Object -Last 1
    if (-not $signtool) {
        throw "signtool.exe not found under the Windows 10 SDK - cannot PFX-sign."
    }
    $env:SIGNTOOL_PATH = $signtool.FullName
} else {
    # Sets AZURE_CODE_SIGNING_DLIB, AZURE_METADATA_JSON,
    # and SIGNTOOL_PATH for bin/windows-sign.js.
    Write-Output "--- :lock: Configuring Windows code signing (Azure Artifact Signing)"
    Invoke-Checked { & 'setup_azure_trusted_signing.ps1' }
}

Write-Output "--- :windows: Building signed NSIS installer"
Invoke-Checked { yarn run build:main }
Invoke-Checked { yarn electron-builder --config electron-builder.json build --publish never }

# Fail loud on any unsigned binary rather than shipping it.
function Assert-Signed {
    param([Parameter(Mandatory)][System.IO.FileInfo[]]$Binaries, [Parameter(Mandatory)][string]$Label)
    if ($Binaries.Count -eq 0) {
        throw "No binaries to verify for ${Label} - did the packaged layout change?"
    }
    $failures = @()
    foreach ($binary in $Binaries) {
        & $env:SIGNTOOL_PATH verify /pa /q $binary.FullName
        if ($LASTEXITCODE -ne 0) {
            # Re-run without /q so the reason lands in the log instead of forcing
            # an operator to RDP into the worker.
            Write-Output "[!] Not signed: $($binary.FullName)"
            & $env:SIGNTOOL_PATH verify /pa /v $binary.FullName
            $failures += $binary.FullName
        }
    }
    if ($failures.Count -gt 0) {
        Write-Output "^^^ +++"
        throw "$($failures.Count) of $($Binaries.Count) ${Label} binaries are NOT signed."
    }
    Write-Output "Verified all $($Binaries.Count) ${Label} binaries are signed."
}

Write-Output "--- :mag: Verifying signatures on packed binaries"
$unpacked = @(Get-ChildItem -Path release -Directory -Filter 'win*-unpacked')
foreach ($dir in $unpacked) {
    $binaries = @(Get-ChildItem -Path $dir.FullName -Recurse -Include '*.exe', '*.node', '*.dll' -File)
    Assert-Signed -Binaries $binaries -Label $dir.Name
}

# Drop the unpacked trees so the artifact upload doesn't ferry thousands of
# loose files; keep the installer, its blockmap, and the electron-updater feed.
Get-ChildItem -Path release -Directory -Filter 'win*-unpacked' | Remove-Item -Recurse -Force

$exe = @(Get-ChildItem -Path release -Filter '*.exe' -ErrorAction SilentlyContinue)
if (-not $exe) {
    throw "No .exe produced in desktop/release - the NSIS build did not emit an installer."
}
Assert-Signed -Binaries $exe -Label 'installer'

Write-Output "--- :white_check_mark: Built $($exe.Count) installer(s):"
$exe | ForEach-Object { Write-Output "  $($_.Name)" }
