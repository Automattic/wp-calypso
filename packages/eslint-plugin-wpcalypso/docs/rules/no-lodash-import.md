# Disallow importing from the root Lodash module (no-lodash-import)

When importing a Lodash function from the root module, the entire Lodash package will be included in the consuming bundle. This can increase the size of a bundle by 400kb or more when only a single function may be needed. By specifically targeting a Lodash module instead, only the required dependent files are included.

## Rule Details

This rule aims to prevent importing of the `lodash` module via the `require` function or `import` statement.

The following patterns are considered warnings:

```js
// Require
var mapKeys = require( 'lodash' ).mapKeys;

// Import statement
import { mapKeys } from 'lodash';
```

The following patterns are not warnings:

```js
// Require
var mapKeys = require( 'lodash/mapKeys' );

// Import statement
import mapKeys from 'lodash/mapKeys';
```
