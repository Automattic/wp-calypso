# Webpack Config

[Webpack](https://webpack.js.org/) config for WordPress development.

## Installation

Install the module

```bash
npm install @wordpress/webpack-config --save-dev
```

## Usage

This is how to extend the default WordPress config for Webpack. You have to create your own `webpack.config.js` file in the root of your project, import the config and extend it with your custom settings as follows:

```js
const { config } = require( '@wordpress/webpack-config' );

module.exports = Object.assign( {}, config, {
	// apply your changes here
} );
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
