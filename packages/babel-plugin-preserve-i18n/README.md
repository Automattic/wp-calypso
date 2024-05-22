# Babel plugin optimize i18n

Babel plugin that transforms this:

```js
import { __, _x } from '@wordpress/i18n';

__( 'Hello' );
_x( 'World' );
```

to this:

```js
import { __ as alias__, _x as alias_x } from '@wordpress/i18n';

const __ = alias__;
const _x = alias_x;

__( 'Hello' );
_x( 'World' );
```

Inspired by [babel-plugin-optimize-react](https://www.npmjs.com/package/babel-plugin-optimize-react) that does similar transforms for React imports.

The transform ensures that the `__('Hello')` syntax remains intact in the output bundle (and even after minification if Terser uses the `mangle.reserved` option) and can be extracted by WP i18n tools.
