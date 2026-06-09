# Windows code-signing cert handover (PFX → Azure Trusted Signing)

The Windows direct-download installer (NSIS) auto-updates via `electron-updater`.
On Windows, `electron-updater` only installs an update whose Authenticode signature publisher matches a `publisherName` it reads from the **currently installed** app — not from the download.

`win.publisherName` was never set in `electron-builder.json`, so each build baked in whatever CN its signing certificate happened to have.
Migrating Windows signing from the Sectigo PFX (`Automattic, Inc.`) to Azure Trusted Signing (`Automattic Inc.`) changes that CN, so an Azure-signed installer is rejected by every app installed from a PFX-signed build — those users silently stop auto-updating.

## The fix

`win.publisherName` is now a fixed list of both names:

```json
"win": {
  "publisherName": [ "Automattic, Inc.", "Automattic Inc." ]
}
```

This decouples the accepted publisher from the signing cert's CN, so once a user is on a build carrying this config, their app accepts updates signed by **either** certificate — and the next cert rotation can't repeat this.

## The handover, in order

1. **Bridge release — PFX-signed, carrying the dual `publisherName` above.**
   It must be **PFX-signed**: an Azure-signed build would already be rejected by the stranded users it needs to reach.
   Hard deadline: it must ship **while the Sectigo PFX cert is still valid (before 2026-07-05)** — after that the cert can no longer sign, and any user not yet on a dual-`publisherName` build is stranded for good.
2. Existing users auto-update to the bridge. Their app's accepted-publisher list now includes the Azure CN.
3. **Cut over to Azure Trusted Signing** (AINFRA-2237). Bridged users accept the Azure-signed installers.

Store `.appx` users are unaffected — the Microsoft Store re-signs and owns those updates.
