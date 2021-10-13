# Development

At its simplest level, the WordPress.com for Desktop app is a dedicated browser for WordPress.com on the web.

Electron provides all the interfacing between Chrome (the browser that is used inside Electron), and the native platform. This means we can load the WordPress.com webapp while still providing native platform features (such as native notifications).

It is important to understand where code runs, and for this the terminology is:

- Main - this is the Electron wrapper. All code for this is contained in `desktop` and `client/desktop` directories
- Renderer - this is the Chrome browser and is where Calypso runs

We use Electron's [IPC](https://github.com/atom/electron/blob/master/docs/api/ipc-main.md) mechanism to send data between the main process and the renderer.

## Starting the app

### How does it work?

Note that _(main)_ and _(renderer)_ will be added to show where the code actually runs.

For clarity, all file and folder locations are relative to the root of the Calypso monorepo.

- _(main)_ The `main` entry in `desktop/package.json` refers to `app/index.js`, which is the entrypoint of the business logic running in Electron's main process. In production builds, this entrypoint is bundled with webpack to the file `dist/index.js`.
- _(main)_ Various [app handlers](../app/app-handlers/README.md) are loaded from `desktop/app/app-handlers` - these are bits of code that run before the main window opens
- `desktop/app/mainWindow/index.js` is where the application `BrowserWindow` is initialized after all app handlers have been loaded. The `BrowserWindow` embeds a nested `BrowserView` and the application's "navigation bar" (buttons for simple browser actions like Back, Forward and Home). The nested `BrowserWindow` loads the WordPress.com webapp.
- _(main)_ A [preload script](../public_desktop/preload.js) is added to the `BrowserView` configuration. Electron executes this preload script before all other scripts when a page is loaded in the view, and injects Inter-Process Communication ("IPC") channels into the Renderer (browser) process. These IPC channels facilitate communication to/from Calypso for things like fetching authentication credentials and keyboard/menu shortcuts to specific locations within Calypso. Handlers in Calypso for these IPC events are defined in the [desktop listeners](../../client/lib/desktop-listeners/index.js) file.
- _(renderer)_ The preload script also injects an `electron` object into the Renderer's global `window` object. In order to affect the behavior of the WordPress.com webapp in select circumstances, Calypso can determine whether it is in a Desktop app context by checking for the presence of this `window.electron` object. For convenience, this check is exposed as the `config.isEnabled( 'desktop' )` flag in Calypso. In order to make this and other feature flag overrides, Calypso's default [configuration](../../packages/calypso-config/src/index.ts) is overriden by the Desktop application at runtime if `window.electron` is present.
- _(main)_ After the `BrowserWindow` has been created, various [window handlers](../app/window-handlers/README.md) are loaded that add behaviors to the window and view instances (spellchecking, navigation, notifications, etc).
- _(renderer)_ In addition to the preload script, the `desktop/public_desktop` folder also contains other assets that are loaded into the Renderer process independent of Calypso, such as HTML and CSS for the application's Preferences and About panes. For convenience, the application's icons are located here as well.

Phew!

## How do I change the main app?

All app code is contained in the `desktop` directory, and desktop overrides are implemented in Calypso as-needed (using the `config.isEnabled( 'desktop' )` check described in the prior section). Changes you make to the Desktop's application Node process (main) logic require a rebuild and restart of the app.

- [Config](../desktop-config/README.md) - app configuration values
- [Libraries](../app/lib/README.md) - details of the local libraries used
- [App Handlers](../app/app-handlers/README.md) - handlers that run before the main window is created
- [Window Handlers](../app/window-handlers/README.md) - handlers that run after the main window is created

The application can also be run in a development mode that uses the localhost instance of Calypso, instead of loading the production WordPress.com webapp. Refer to the main desktop [README](../README.md) for details.

## Debugging

Debug output from Calypso will appear inside the renderer. To enable, open Chrome dev tools from the View menu and enable debug:

```js
localStorage.setItem( 'debug', '*' );
```

## Building and Debugging on Windows

Building Calypso on Windows is not supported, and therefore a virtual Linux environment is required to build the application source. Application binaries, however, should be built natively on Windows prior to packaging the app.

- For convenience, a Docker configuration is included [here](../Dockerfile). The image can be built and ran via the Makefile.

- An alternative to using Docker on Windows is the Windows Subsystem for Linux ("WSL"), which will have to be manually configured.

### Recommended Windows Environment and Tooling

- [MSYS2](https://www.msys2.org/) is recommended to maximize compatibility of the Makefile across platforms. This can be installed explicitly and added to your `PATH`, or implicitly by installing [Git Bash](https://gitforwindows.org/) for Windows.

  - IMPORTANT: Historically, developers expect the "bash" executable to refer to Git/MSYS2 bash. To avoid collisions with Windows Subsystem for Linux ("WSL"), you can rename the WSL bash executable in PowerShell:

  ```
  takeown /F "$env:SystemRoot\System32\bash.exe"
  icacls "$env:SystemRoot\System32\bash.exe" /grant administrators:F
  ren "$env:SystemRoot\System32\bash.exe" wsl-bash.exe
  ```

- Install the npm package `windows-build-tools` to allow compilation of native node modules.
