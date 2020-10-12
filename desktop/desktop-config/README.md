# Configuration

The app is configured via a JSON file that is built at compile time.

The build process is:

- The `config-base.json` file is used as the base config
- Values from the appropriate build config files then override the base values
- Final config is stored in `desktop/config.json`, which is then used by the app

## Config Values

`server_port` - Calypso server port

`server_url` - Calypso server URL

`server_host` - Calypso server host name

`debug` - `false` to disable, or a set of debug config

`mainWindow` - main app window config

`preferencesWindow` - preference window config

`aboutWindow` - about window config

`secretWindow` - secret window config

`crash_reporter` - crash reporter config

`updater` - auto updater config

`settings_filename` - filename used for the user settings (see [lib/settings](../desktop/lib/settings/README.md))

`default_settings` - default values used for the user settings

## Debug config

`enabled_by_default` - whether debug mode is enabled by default

`namespace` - the [debug](https://github.com/visionmedia/debug) namespace

`clear_log` - whether to clear the log at app start

`colors` - whether to show colors in debug output

## Updater config

`url` - Base URL for the updater

`delay` - Delay after app starts before checking for updates (ms)

`interval` - Interval between each update check (ms)

## Crash Reporter config

`url` - a URL used to post crash reports

`tracker` - enable crash tracking (see [lib/crash-tracker](../desktop/lib/crash-tracker/README.md))

`electron` - enable Electron crash reporter

## Window config

Window config is taken directly from the [Electron BrowserWindow](https://github.com/atom/electron/blob/HEAD/docs/api/browser-window.md#new-browserwindowoptions)
