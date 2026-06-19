#Requires -Version 5.1
<#
.SYNOPSIS
    Builds the signed WordPress.com desktop Windows NSIS direct-download
    installer on Buildkite.

    Unlike the Store .appx (build-desktop-windows.ps1), this is the
    direct-download path: it is code-signed and keeps the in-app
    electron-updater enabled, so existing users auto-update to it.

    This is the PFX-signed "bridge" build of the PFX -> Azure Trusted Signing
    migration (AINFRA-2237): it must stay PFX-signed and ship while the Sectigo
    cert is still valid (before 2026-07-05) so existing installs accept it.
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

# Materialize the org Windows signing certificate from AWS Secrets Manager
# (writes certificate.pfx). Provided by the CI Toolkit Buildkite plugin and used
# by every a8c Windows-signing app; WINDOWS_CODE_SIGNING_CERT_PASSWORD is the
# matching cert password, already on the windows queue.
Write-Output "--- :lock: Configuring Windows code signing (CI Toolkit cert)"
Invoke-Checked { & 'setup_windows_code_signing.ps1' }

if ([string]::IsNullOrEmpty($env:WINDOWS_CODE_SIGNING_CERT_PASSWORD)) {
    throw "WINDOWS_CODE_SIGNING_CERT_PASSWORD is not set on this agent."
}
$certPath = (Convert-Path '.\certificate.pfx')
$env:WIN_CSC_LINK = $certPath
$env:WIN_CSC_KEY_PASSWORD = $env:WINDOWS_CODE_SIGNING_CERT_PASSWORD
# electron-builder skips signing on CI PR builds unless this is set - needed to
# exercise signing here. Gate to trunk/release before production.
$env:CSC_FOR_PULL_REQUEST = 'true'
# Workaround (per simplenote-electron): import the cert so the signer finds it.
Import-PfxCertificate -FilePath $certPath -CertStoreLocation Cert:\LocalMachine\Root `
    -Password (ConvertTo-SecureString -String $env:WINDOWS_CODE_SIGNING_CERT_PASSWORD -AsPlainText -Force) | Out-Null

Write-Output "--- :windows: Building signed NSIS installer"
Invoke-Checked { yarn run build:main }
Invoke-Checked { yarn electron-builder --config electron-builder.json build --publish never }

# Drop the unpacked trees so the artifact upload doesn't ferry thousands of
# loose files; keep the installer, its blockmap, and the electron-updater feed.
Get-ChildItem -Path release -Directory -Filter 'win*-unpacked' | Remove-Item -Recurse -Force

$exe = @(Get-ChildItem -Path release -Filter '*.exe' -ErrorAction SilentlyContinue)
if (-not $exe) {
    throw "No .exe produced in desktop/release - the NSIS build did not emit an installer."
}
Write-Output "--- :white_check_mark: Built $($exe.Count) installer(s):"
$exe | ForEach-Object { Write-Output "  $($_.Name)" }
