# Calypso Polyfills

This package includes several configurations for required polyfills for Calypso, targeting three different environments: node, evergreen (newer browsers) and fallback (older browsers).

## Features

`calypso-polyfills` ties into the Calypso build process, to ensure that only the required polyfills for each build target are needed. Through the use of Babel's `preset-env` and `browserslist` configurations, we strip out any polyfills that are supported for all browsers that are supported by that build target.

See the root directory's `package.json` for the list of supported browsers for each build target.

## Usage

In Node.js, simply require the package:

```js
require( '@automattic/calypso-polyfills' );
```

In a browser, a similar naked import will include the polyfills (defaulting to the `fallback` set):

```js
import '@automattic/calypso-polyfills';
```

If you want to explicitly include the `evergreen` or `fallback` polyfills, you can append to the import path:

```js
import '@automattic/calypso-polyfills/browser-evergreen';
import '@automattic/calypso-polyfills/browser-fallback';
```
