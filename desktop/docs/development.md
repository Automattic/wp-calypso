# Development

At its simplest level, the WordPress.com for Desktop app uses Electron to wrap Calypso inside a native app.

Electron provides all the interfacing between Chrome (the browser that is used inside Electron), and the native platform. This means we can re-use Calypso code while still providing native platform features.

It is important to understand where code runs, and for this the terminology is:

- Main - this is the Electron wrapper. All code for this is contained in `desktop` and `client/desktop` directories
- Renderer - this is the Chrome browser and is where Calypso runs

We use Electron's [IPC](https://github.com/atom/electron/blob/master/docs/api/ipc-main.md) mechanism to send data between the main process and the renderer.

## Starting the app

### How does it work?

It's a fairly complicated process so buckle up. Note that _(main)_ and _(renderer)_ will be added to show where the code actually runs.

For clarity, all file and folder locations are relative to the root of the Calypso monorepo.

- _(main)_ The `main` entry in `desktop/package.json` refers to `build/desktop.js`, which is the entrypoint of the compiled webpack bundle of the Calypso server running in Electron's main process.
  - The Calypso server is an Express.js HTTP server that serves files to Electron's Renderer process.
  - `client/desktop/server/index.js` is where the Calypso server is started by the Electron process. Calypso's `boot` code is contained in the file `client/server/boot/index.js`.
- _(main)_ `client/desktop/index.js` sets up the environment in `client/desktop/env.js` - this includes Node paths for Calypso
- _(main)_ Various [app handlers](../../client/desktop/app-handlers/README.md) are loaded from `client/desktop/app-handlers` - these are bits of code that run before the main window opens
- _(main)_ A Calypso server is started directly from Electron's Node process in `client/desktop/server.js`. The server is customized to serve files from the following directories:
  - `/calypso` - mapped to `/public`
  - `/desktop` - mapped to `/public_desktop`
- _(main)_ An Electron `BrowserWindow` is opened and loads the 'index' page from the Calypso server
- _(main)_ Once the window has opened the [window handlers](../../client/desktop/window-handlers/README.md) load to provide interaction between Calypso and Electron
- _(renderer)_ Calypso's index page is served by a React renderer in `client/document/desktop.jsx`. In addition:
  - `desktop/public_desktop/wordpress-desktop.css` - any CSS specific to the desktop app (mapped to `desktop` directory mentioned above)
  - `desktop/public_desktop/desktop-app.js` - desktop-specific JS and also the Calypso boot code (mapped to `desktop` directory mentioned above)
  - The Calypso client bundle for the Desktop app is built to `desktop/public`.
    - The built Calypso bundle has multiple webpack entrypoints (like `entry-main.[hash].min.js`).
    - The various Calypso filenames are written to `desktop/build/assets-evergreen.js` at buildtime. The Express.js server loads this `assets-evergreen.js` file to find out which `<script>` and `link rel="stylesheet">` tags to send to the browser.
- _(renderer)_ The `desktop-app.js` code runs which sets up various app-specific handlers that need to be inside the renderer. It also starts Calypso with `AppBoot()`
- _(renderer)_ The code in `calypso/client/lib/desktop` runs to send and receive IPC messages between the main process and Calypso.

Phew!

## How do I change the main app?

All app code is contained in the `desktop` and `client/desktop` directories. Any changes you make there require a rebuild and restart of the app.

- [Config](../desktop-config/README.md) - app configuration values
- [Libraries](../../client/desktop/lib/README.md) - details of the local libraries used
- [App Handlers](../../client/desktop/app-handlers/README.md) - handlers that run before the main window is created
- [Window Handlers](../../client/desktop/window-handlers/README.md) - handlers that run after the main window is created

## Debugging

Debug from Calypso will appear inside the renderer. To enable, open Chrome dev tools from the View menu and enable debug:

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
