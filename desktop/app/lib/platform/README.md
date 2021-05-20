# Platform

Provides a wrapper around platform-specific features.

Note that the term dock is used to refer to the OS X and Windows tray.

For more specific platform features refer here:

- [OS X](mac/README.md)
- [Windows](windows/README.md)

## General functions

`setMainWindow( mainWindow )` - needs to be called once the main app window is ready

Where:

- `mainWindow` - the main `BrowserWindow` instance

`isOSX()` - true if running on OS X, false otherwise

`isWindows()` - true if running on Windows, false otherwise

`isWindows10()` - true if running on Windows 10 (or greater), false otherwise

`isLinux()` - true if running on Linux, false otherwise

`getPlatformString()` - returns the actual platform string as reported by `process.platform`

## Platform specific functions

`restore()` - show and focus the app window

`showNotificationsBadge()` - show a notification badge in the appropriate place

`clearNotificationsBadge()` - remove any notification badge

`setDockMenu( enabled )` - toggle any dock menu items with `requiresUser`

Where:

- `enabled` - boolean
