# webpack-extensive-lodash-replacement-plugin

Replaces most usage of `lodash` with `lodash-es`:

```js
import { map } from 'lodash';
// becomes
import { map } from 'lodash-es';

import map from 'lodash/map';
// becomes
import map from 'lodash-es/map';

import camelCase from 'lodash.camelcase';
// becomes
import camelCase from 'lodash-es/camelCase';
```

This applies transitively to the whole codebase. However, requested versions are
compared against the root's `lodash-es` version to ensure that they can be replaced.

**Note:**: The `lodash-es` version in the root `package.json` must be defined as a single version
string (e.g. "4.17.11"), not a range.

## Usage

_webpack.config.js_
```js
const ExtensiveLodashReplacementPlugin =
  require( '@automattic/webpack-extensive-lodash-replacement-plugin' );

module.exports = {
  ...,
  plugins: [
    new ExtensiveLodashReplacementPlugin( './package.json' ),
    ...
  ]
};
```

The optional constructor argument is the location of the `package.json` file for the project.
