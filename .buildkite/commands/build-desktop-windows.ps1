#Requires -Version 5.1
<#
.SYNOPSIS
    Builds the unsigned WordPress.com desktop Windows Store .appx on Buildkite.

    The Store re-signs .appx packages on ingestion, so this build is intentionally
    unsigned (see `electron-builder-appx.json` and AINFRA-2273). The signed NSIS
    direct-download installer is a separate, later phase.
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
# Corepack ships with Node; it provisions the repo-pinned Yarn (packageManager
# field). COREPACK_ENABLE_DOWNLOAD_PROMPT=0 keeps the download non-interactive.
$env:COREPACK_ENABLE_DOWNLOAD_PROMPT = '0'
Invoke-Checked { corepack enable }

Set-Location "$PSScriptRoot\..\..\desktop"

Write-Output "--- :yarn: Installing desktop dependencies"
Invoke-Checked { yarn install --immutable --inline-builds }

Write-Output "--- :windows: Building unsigned Store appx"
$env:CONFIG_ENV = 'release'
$env:SKIP_TSC = 'true'
$env:PLAYWRIGHT_SKIP_DOWNLOAD = 'true'
# Tells build-desktop-config.js to disable the in-app updater - the Store owns
# updates for Store-distributed packages.
$env:WINDOWS_STORE = '1'
# `build:app` passes ${ELECTRON_BUILDER_ARGS} straight to electron-builder.
# Point it at the appx config so it emits the Store package instead of NSIS.
$env:ELECTRON_BUILDER_ARGS = '--config electron-builder-appx.json'
Invoke-Checked { yarn run build }

# The appx target also leaves unpacked `win-*-unpacked/` trees and electron-builder
# bookkeeping files. Drop everything but the .appx packages so the artifact upload
# doesn't ferry thousands of loose files.
Get-ChildItem -Path release -Directory -Filter 'win*-unpacked' | Remove-Item -Recurse -Force
Get-ChildItem -Path release -File -Include '*.yml', 'builder-debug.yml' | Remove-Item -Force

$appx = Get-ChildItem -Path release -Filter '*.appx' -ErrorAction SilentlyContinue
if (-not $appx) {
    Write-Error "No .appx produced in desktop/release - the Windows Store build did not emit a package."
    exit 1
}
Write-Output "--- :white_check_mark: Built $($appx.Count) appx package(s):"
$appx | ForEach-Object { Write-Output "  $($_.Name)" }
