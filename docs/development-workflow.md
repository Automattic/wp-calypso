# Development Workflow

## Build

Running `yarn start` will build all the code and continuously watch the front-end JS and CSS/Sass for changes and rebuild
accordingly.

### Limited builds

Calypso is [broken up into sections](https://github.com/Automattic/wp-calypso/blob/HEAD/client/sections.js) and by default, every section is built when the development server starts.
This can take a long time and slow down incremental builds as your work. To speed things up,
you can choose to build and run specific sections of Calypso using the `SECTION_LIMIT` environment variable.

For instance, `SECTION_LIMIT=reader,login yarn start` would start Calypso and only build the `reader` and `login` sections.

To find all available sections in the main entry point, you can refer to the [sections.js file](https://github.com/Automattic/wp-calypso/blob/HEAD/client/sections.js). Note that the other entry points are likely to register and handle additional sections.

Additionally, in Calypso, we use multiple [Webpack entry points](https://webpack.js.org/concepts/entry-points/) for separating concerns and serving smaller bundles to the user at any given time.
Building a limited number of entry points speeds up the build process, and to allow that, the `ENTRY_LIMIT` environment variable is available to allow building and running only a specific entry point.

For example: `ENTRY_LIMIT=entry-login,entry-main yarn start` would start Calypso and only build the login and the main entry points.

To find all available entry points, you can refer to the `entry` option in Calypso's primary `webpack.config.js` file.

## Tests

If you want to run the tests for a specific library in `client/` use:

```bash
> yarn run test-client client/<subdirectory>/test
```

or for running all tests (client, server, test), use:

```bash
> yarn test
```

The [test/README.md](../test/README.md) file documents how to create new tests, how to watch for file changes, and how to run all or just some tests from the test suite.

## Errors and Warnings

Errors and warning appear in the normal places – the terminal where you ran `yarn start` and the JavaScript console in the browser. If something isn’t going the way you expected it, look at those places first.

## Debugging

Calypso uses the [debug](https://github.com/visionmedia/debug) module to handle debug messaging. To turn on debug mode for all modules, type the following in the browser console:

```js
localStorage.setItem( 'debug', '*' );
```

You can also limit the debugging to a particular scope:

```js
localStorage.setItem( 'debug', 'calypso:*' );
```

The `node` server uses the `DEBUG` environment variable instead of `localStorage`. `yarn start` will pass along its environment, so you can turn on all debug messages with:

```bash
DEBUG=* yarn start
```

or limit it as before with:

```bash
DEBUG=calypso:* yarn start
```

### Debugging Node.js

To debug the running server, you can use [Node.js's built-in debugging client](https://nodejs.org/en/learn/getting-started/debugging)
by passing the `--inspect` flag when starting the server directly. You will need to manually build
the project before starting the process.

1. `yarn build`
2. `node --inspect build/server.js`

If you would like to debug the startup process as well, it might be convenient to have the debugger
break on the first line and wait for you. In that case, you should also use `--inspect-brk` instead
of `--inspect`.

Then, open Chrome and navigate to `chrome://inspect`. Click on "Open dedicated DevTools for Node"
under the "Remote Target" section. A DevTools window will open where you can set breakpoints and
debug as usual.

#### Debugging in VS Code

1. Run `yarn start:debug`
2. Set breakpoints in VS Code.
3. Select the appropriate launch configuration and start the debugger.

## Monitoring builds and tests

Throughout your Calypso development workflow, you will find yourself waiting — either for a build to finish or for tests to run. Rather than standing idle looking at terminals while you wait, you can use status indicators and/or system notifications.

One such tool is [AnyBar](https://github.com/tonsky/AnyBar) (_macOS only_), a very barebones menubar indicator. Here's a brief screencast of AnyBar reporting builds and tests for Calypso:

<video src="https://cldup.com/LOqXUo351n.mp4" controls>
<a href="https://cldup.com/LOqXUo351n.mp4">(video)</a>
</video>

### Set-up

- Install [AnyBar](https://github.com/tonsky/AnyBar): `brew cask install anybar`
- Run it at the default port: `open -a AnyBar`
- Obtain this [handler shell script](https://gist.github.com/mcsf/56911ae03c6d87ec61429cefc7707cb7/)
- Optionally, place the script somewhere memorable and make it executable: `chmod +x ~/bin/anybar-calypso`
- From now on, pipe your Calypso commands through it:
  - `yarn start | anybar-calypso`
  - `yarn run test-client:watch client/my-component | anybar-calypso`
- Feel free to tweak the script and share improvements with the Calypso project

### Other platforms

`anybar-calypso` communicates with AnyBar by sending simple strings via UDP to a local port. This means that it can trivially be adapted to work with any other notification system, either by listening to UDP traffic or by altering `anybar-calypso` directly.
