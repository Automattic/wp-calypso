# Calypso Polyfills

This package includes several configurations for required polyfills for Calypso, targeting two different environments: node, and browsers.

## Features

`calypso-polyfills` ties into the Calypso build process, to ensure that only the required polyfills for each build target are needed. Through the use of Babel's `preset-env` and `browserslist` configurations, we strip out any polyfills that are supported for all browsers that are supported by that build target.

See the root directory's `package.json` for the list of supported browsers for each build target.

## Usage

In Node.js, simply require the package:

```js
require( '@automattic/calypso-polyfills' );
```

In a browser, a similar naked import will include the polyfills:

```js
import '@automattic/calypso-polyfills';
```
