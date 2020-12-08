# webpack-extensive-lodash-replacement-plugin

Replaces most usage of `lodash` with `lodash-es`:

```js
import { uniq } from 'lodash';
import map from 'lodash/map';
import camelCase from 'lodash.camelcase';
```

Becomes:

```js
import { uniq } from 'lodash-es';
import map from 'lodash-es/map';
import camelCase from 'lodash-es/camelCase';
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
