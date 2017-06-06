# Development

At its simplest level, the WordPress.com for Desktop app uses Electron to wrap up Calypso inside a native app.

Electron provides all the interfacing between Chrome (the browser that is used inside Electron), and the native platform. This means we can re-use Calypso code while still providing native platform features.

It is important to understand where code runs, and for this the terminology is:

- Main - this is the Electron wrapper. All code for this is contained in `desktop`
- Renderer - this is the Chrome browser and is where Calypso runs

We use Electron's [IPC](https://github.com/atom/electron/blob/master/docs/api/ipc-main.md) mechanism to send data between the main process and the renderer.

## Starting the app

So what happens when you `make run`? It's a fairly complicated process so buckle up. Note that *(main)* and *(renderer)* will be added to show where the code actually runs.

- *(main)* Electron looks at the `main` item in `package.json` - this is the boot file, and refers to `desktop/index.js`
- *(main)* `desktop/index.js` sets up the environment in `desktop/env.js` - this includes Node paths for Calypso
- *(main)* Various [app handlers](../desktop/app-handlers/README.md) are loaded from `desktop/app-handlers` - these are bits of code that run before the main window opens
- *(main)* A Calypso server is started in `desktop/start-app.js` in a forked child_process. The server is customized to serve files from the following directories:
  - `/` - mapped to the Calypso server
  - `/calypso` - mapped to `calypso/public`
  - `/desktop` - mapped to `public_desktop`
- *(main)* An Electron `BrowserWindow` is opened and loads the 'index' page from the Calypso server
- *(main)* Once the window has opened the [window handlers](../desktop/window-handlers/README.md) load to provide interaction between Calypso and Electron
- *(renderer)* Calypso provides the 'index' page from `calypso/server/pages/desktop.jade`, which is a standard Calypso start page plus:
  - `public_desktop/wordpress-desktop.css` - any CSS specific to the desktop app
  - `public_desktop/desktop-app.js` - desktop app specific JS and also the Calypso boot code
  - `calypso/public/build.js` - a prebuilt Calypso
- *(renderer)* The `desktop-app.js` code runs which sets up various app specific handlers that need to be inside the renderer. It also starts Calypso with `AppBoot()`
- *(renderer)* The code in `calypso/client/lib/desktop` runs to send and receive IPC messages between the main process and Calypso.

Phew!

## How do I change the main app?

All app code is contained in `desktop`. Any changes you make there will run the next time you do `make run`.

- [Config](../desktop-config/README.md) - app configuration values
- [Libraries](../desktop/lib/README.md) - details of the local libraries used
- [App Handlers](.,/desktop/app-handlers/README.md) - handlers that run before the main window is created
- [Window Handlers](../desktop/window-handlers/README.md) - handlers that run after the main window is created

Note that currently we do not compile or transpile the app code.

## How do I change Calypso?

All Calypso code is contained in the `calypso` directory as a submodule. If you need to change Calypso and want to try it inside the desktop app then you can:

- `cd calypso`
- Create a new branch or change to an existing branch in Calypso as you would normally

When you do a `make run` it will re-compile any changes in Calypso.

To update the `calypso` directory to the upstream project's latest commit, run `git submodule update --remote`. If you want to commit that change, you need to `git add calypso` to do so.

## Tell me more about the server

We used to boot the Calypso server+app directly within the main Electron process by `require`-ing raw Calypso code. This eventually ran into issues because Automatticians were eager to use ES6, which node is not quite friendly with yet.

Thanks to [Babel](https://babeljs.io/)'s magic transpilation, we already have a node-friendly server bundle available to use. However, we can't just `require` the bundle and be done with it due to various issues such as path resolutions (the working directory inconveniently points to the desktop root, which breaks things).

Instead, during the app's startup process, we fork a child process to load up Calypso using the transpiled bundle. This gives Calypso its own "sandbox" and can run without the app/Electron environment unintentionally interfering with it.

## Debugging

The main process will output debug to the console when debug mode is enabled (found under the app menu). You can also explicitly enable debug mode when running the app:

```
$ DEBUG=* make run
...
desktop:index Starting app handlers +0ms
desktop:index Waiting for app window to load +69ms
desktop:server Checking server port: 41050 on host 127.0.0.1 +63ms
desktop:server Server started +6ms
```

Debug from Calypso will appear inside the renderer. To enable, open Chrome dev tools from the View menu and enable debug:

```js
localStorage.setItem( 'debug', '*' );
```
