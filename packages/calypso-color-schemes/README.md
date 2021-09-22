# Calypso Color Schemes

This package contains a number of CSS custom properties used in Calypso.

![Color scheme thumbnails](screenshot@2x.png)

## Installation

```sh
yarn add @automattic/calypso-color-schemes
```

## Usage

### Using the CSS output

Add this packages CSS from `css/calypso-color-schemes.css` in order to access the CSS custom
properties.

When importing, you can do

```js
import '@automattic/calypso-color-schemes';
```

And this will give you the CSS.

### Using the JS output

Sometimes, `calypso-color-schemes` properties are consumed in JavaScript. To avoid parsing CSS syntax on your own, or to help `postcss-custom-properties` use them without parsing the CSS (much faster), use the JS output as follows:

```js
import { customProperties } from '@automattic/calypso-color-schemes/js'; // mind the js suffix
```

or

```js
const { customProperties } = require( '@automattic/calypso-color-schemes/js' );
```

### Using the JSON output

Like the JS output, a JSON version is provided too. It can be used with `postcss-custom-properties`, and `postcss.config.js` can look like this:

```js
module.exports = () => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes/json' ) ],
		},
	},
} );
```

The JS output can't be used this way until [this issue](https://github.com/postcss/postcss-custom-properties/issues/255) is solved.

### Note on using the JS/JSON outputs

The CSS files include variable definitions for all Calypso color schemes (Classic Blue, Contrast, Midnight, ...), but the JS/JSON exports include only variables from the `:root` selector, i.e., only the fallback default theme.
