# Development

At its simplest level, the WordPress.com for Desktop app uses Electron to wrap Calypso inside a native app.

Electron provides all the interfacing between Chrome (the browser that is used inside Electron), and the native platform. This means we can re-use Calypso code while still providing native platform features.

It is important to understand where code runs, and for this the terminology is:

- Main - this is the Electron wrapper. All code for this is contained in `desktop`
- Renderer - this is the Chrome browser and is where Calypso runs

We use Electron's [IPC](https://github.com/atom/electron/blob/master/docs/api/ipc-main.md) mechanism to send data between the main process and the renderer.

## Starting the app

### How does it work?

It's a fairly complicated process so buckle up. Note that *(main)* and *(renderer)* will be added to show where the code actually runs.

For clarity, all file and folder locations are relative to the root of the Calypso monorepo.

- *(main)* Electron looks at the `main` item in `desktop/package.json` - this is the boot file, and refers to `client/desktop/index.js`
- *(main)* `client/desktop/index.js` sets up the environment in `client/desktop/env.js` - this includes Node paths for Calypso
- *(main)* Various [app handlers](../../client/desktop/app-handlers/README.md) are loaded from `client/desktop/app-handlers` - these are bits of code that run before the main window opens
- *(main)* A Calypso server is started drectly from Electron's Node process in `client/desktop/server.js`. The server is customized to serve files from the following directories:
  - `/` - mapped to the Calypso server
  - `/calypso` - mapped to `calypso/public`
  - `/desktop` - mapped to `public_desktop`
- *(main)* An Electron `BrowserWindow` is opened and loads the 'index' page from the Calypso server
- *(main)* Once the window has opened the [window handlers](../../client/desktop/window-handlers/README.md) load to provide interaction between Calypso and Electron
- *(renderer)* Calypso provides the 'index' page from `calypso/server/pages/desktop.pug`, which is a standard Calypso start page plus:
  - `desktop/public_desktop/wordpress-desktop.css` - any CSS specific to the desktop app
  - `desktop/public_desktop/desktop-app.js` - desktop app specific JS and also the Calypso boot code
  - `desktop/calypso/public/build.js` - a prebuilt Calypso
- *(renderer)* The `desktop-app.js` code runs which sets up various app specific handlers that need to be inside the renderer. It also starts Calypso with `AppBoot()`
- *(renderer)* The code in `calypso/client/lib/desktop` runs to send and receive IPC messages between the main process and Calypso.

Phew!

## How do I change the main app?

All app code is contained in `desktop`. Any changes you make there require a rebuild and restart of the app.

- [Config](../desktop-config/README.md) - app configuration values
- [Libraries](../desktop/lib/README.md) - details of the local libraries used
- [App Handlers](.,/desktop/app-handlers/README.md) - handlers that run before the main window is created
- [Window Handlers](../desktop/window-handlers/README.md) - handlers that run after the main window is created

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
