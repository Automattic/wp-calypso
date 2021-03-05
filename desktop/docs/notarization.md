# MacOS Notarization

Notes on MacOS notarization can be found [here](docs/notarization.md).

Per the current [Electron docs](https://www.electron.build/configuration/dmg), DMG signing is disabled by default as it will "lead to unwanted errors in combination with notarization requirements." Only the app bundle is zipped and submitted to Apple for notarization.

## Extracting Published ZIP Archive in MacOS 10.15 (Catalina)

There is a [known bug](https://github.com/electron-userland/electron-builder/issues/4299#issuecomment-544683923) in which extracting notarized contents from a zip archive via double-click will lead to an invalid .app bundle that cannot be opened in macOS 10.15. Instead, the bundled app should be extracted via `ditto`:

`ditto -x -k <zip archive> <destination folder>`

## Verification

Notarization status of an application bundle can be verified via the `codesign`, `stapler` and `spctl` utilities:

`codesign --test-requirement="=notarized" --verify --verbose WordPress.com.app`

`xrun stapler validate WordPress.com.app`

`spctl -a -v WordPress.com.app`
