Development Workflow
====================

## Build

Running `yarn start` will build all the code and continuously watch the front-end JS and CSS/Sass for changes and rebuild
accordingly.

### Limited builds

Calypso is [broken up into sections](https://github.com/Automattic/wp-calypso/blob/master/client/sections.js) and by default, every section is built when the development server starts.
This can take a long time and slow down incremental builds as your work. To speed things up,
you can choose to build and run specific sections of Calypso using the `SECTION_LIMIT` environment variable.

For instance, `SECTION_LIMIT=reader,login yarn start` would start Calypso and only build the `reader` and `login` sections.

To find all available sections in the main entry point, you can refer to the [sections.js file](https://github.com/Automattic/wp-calypso/blob/master/client/sections.js). Note that the other entry points are likely to register and handle additional sections.

Additionally, in Calypso, we use multiple [Webpack entry points](https://webpack.js.org/concepts/entry-points/) for separating concerns and serving smaller bundles to the user at any given time.
Building a limited number of entry points speeds up the build process, and to allow that, the `ENTRY_LIMIT` environment variable is available to allow building and running only a specific entry point.

For example: `ENTRY_LIMIT=entry-login,entry-main yarn start` would start Calypso and only build the login and the main entry points.

To find all available entry points, you can refer to the `entry` option in Calypso's primary `webpack.config.js` file.

### Internet Explorer

It's possible to debug/fix IE issues using the [fallback development workflow](./fallback-development-workflow.md).

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

### Debugging node

Since building and starting the express server is done via a npm command, the normal method of passing argument to the node process won't work. However, you can start the debugger via the `NODE_ARGS` environment variable. The value of this variable is passed to the node command when executing `yarn start`.  This means you can run the built-in inspector by running `NODE_ARGS="--inspect" yarn start`.  Starting the debugger is similar: `NODE_ARGS="--debug=5858" yarn start`.  If you would like to debug the build process as well, it might be convenient to have the debugger/inspector break on the first line and wait for you.  In that case, you should also pass in the `--debug-brk` option like so: `NODE_ARGS="--inspect --debug-brk" yarn start` (note: `--debug-brk` can also be used with the `--debug` flag).

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
  * `yarn start | anybar-calypso`
  * `yarn run test-client:watch client/my-component | anybar-calypso`
- Feel free to tweak the script and share improvements with the Calypso project

### Other platforms

`anybar-calypso` communicates with AnyBar by sending simple strings via UDP to a local port. This means that it can trivially be adapted to work with any other notification system, either by listening to UDP traffic or by altering `anybar-calypso` directly.
