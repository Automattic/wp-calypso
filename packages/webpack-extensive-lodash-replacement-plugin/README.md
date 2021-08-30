# webpack-extensive-lodash-replacement-plugin

Replaces most usage of `lodash` with `lodash-es`:

```js
import { get } from 'lodash';
import camelCase from 'lodash.camelcase';
import map from 'lodash/map';
```

Becomes:

```js
import { get } from 'lodash-es';
import camelCase from 'lodash-es/camelCase';
import map from 'lodash-es/map';
```

This applies transitively to the whole codebase. However, requested versions are
compared against the root's `lodash-es` version to ensure that they can be
replaced.

## Usage

_webpack.config.js_

```js
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );

module.exports = {
	plugins: [ new ExtensiveLodashReplacementPlugin( { baseDir: '.' } ) ],
};
```

The optional `baseDir` is the base directory for the root project.

```

```
