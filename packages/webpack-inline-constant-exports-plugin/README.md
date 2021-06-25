# webpack-inline-constant-exports-plugin

Detects that bindings exported from a module are constants and inlines them at the usage site.

_constants.js_

```js
export const BLOGGER = 'BLOGGER_PLAN'; // strings
export const PREMIUM = 'PREMIUM_PLAN';
export const MONTHS_IN_YEAR = 12; // numbers
export const MONTLY_BILLING = false; // boolean
export const NO_PLAN = null; // null
```

_app.js_

```js
import { BLOGGER, PREMIUM } from './constants';

console.log( BLOGGER, PREMIUM );
```

If the `constants.js` file is marked as constants module, eligible constants (strings, numbers,
booleans, anything that's `===`-equal to each other even for different instances) will be inlined
into the importing module and the actual import will be removed:

_bundled-app.js_

```js
console.log( 'BLOGGER_PLAN', 'PREMIUM_PLAN' );
```

## Usage

_webpack.config.js_

```js
const InlineConstantExportsPlugin = require( '@automattic/webpack-inline-constant-exports-plugin' );

module.exports = {
	plugins: [ new InlineConstantExportsPlugin( [ /\/constants.js/ ] ) ],
};
```

The constructor argument is an array of regexp matchers: if a matcher matches a module resource
path, the module will be treated as an constant-exporting one and these exports will be inlined.

## Side Effects

If you import bindings from a constants module:

```js
import { BLOGGER, PREMIUM } from './constants';
```

it is assumed that the module is imported only to get the constant bindings, and not for its
side effects. The import will be removed if all the imported bindings were inlined and the
potential side effects will not be performed.

In other words, it's like the module declared `sideEffects: false` in its `package.json`.
