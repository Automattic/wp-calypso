Development Workflow
====================

## Build

Running `make run` will build all the code and continuously watch the front-end JS and CSS/Sass for changes and rebuild accordingly. In the case of React components, after the rebuild, the code is reloaded live in the browser and you should be able to see the changes without a refresh (CSS and changes deeper in the logic still need a refresh, but this will change, soon).

## Tests

The [test/README.md](../test/README.md) file documents how to create new tests, and how to run all or just some tests from the test suite.

## Errors and Warnings

Errors and warning appear in the normal places – the terminal where you ran `make run` and the JavaScript console in the browser. If something isn’t going the way you expected it, look at those places first.

## Debugging

Calypso uses the [debug](https://github.com/visionmedia/debug) module to handle debug messaging. To turn on debug mode for all modules, type the following in the browser console:

```js
localStorage.setItem( 'debug', '*' );
```

You can also limit the debugging to a particular scope

```js
localStorage.setItem( 'debug', 'calypso:*' );
```

The `node` server uses the `DEBUG` environment variable instead of `localStorage`. `make run` will pass along it’s environment, so you can turn on all debug messages with

```bash
DEBUG=* make run
```

or limit it as before with

```bash
DEBUG=calypso:* make run
```
