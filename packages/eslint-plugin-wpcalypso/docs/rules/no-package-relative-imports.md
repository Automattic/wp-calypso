# Forbid package-relative imports

When importing modules, we support importing them relative to `./client` but using a absolute syntax:

```js
import config from 'config';
import userFactory from 'lib/user';
```

Those work because Webpack will search for those modules in ./client first, and then in node_modules (so the example above gets resolved as ./client/config and ./client/lib/user). The current approach has some problems, namely having to configure every module resolution (webpack, node.js, typescript, IDEs...) to understand and follow that pattern.

As an alternative, we can rewrite the above as

```js
import config from 'wp-calypso/config';
import userFactory from 'wp-calypso/lib/user';
```

Which works because `wp-calypso` is a valid package in our repository, points to `./client` and is declared as a dependency in the root `package.json`. This will work out of the box in all module resolution systems.

This rule forbid the former approach and can auto-fix it to the latter.

## Rule Details

The following patterns are considered an error:

```js
import config from 'config';
import * as stats from 'reader/stats';
import { localizeUrl } from 'lib/i18n-utils';
export { default as ActionCard } from 'components/action-card/docs/example';
export * from 'components/AppBar';
const config = require('config');
```

The following patterns are not warnings:

```js
import config from 'wp-calypso/config';
import * as stats from 'wp-calypso/reader/stats';
import { localizeUrl } from 'wp-calypso/lib/i18n-utils';
export { default as ActionCard } from 'wp-calypso/components/action-card/docs/example';
export * from 'wp-calypso/components/AppBar';
const config = require('wp-calypso/config');

import config from './config';
import config from '../../../config';
import config from 'dirA'; //when `dirA` is not a directory or file in ./client/
```

## Configuration

The rule accept a configuration object with:

* `mapping`. An array of objects like `{dir: string, module: string}`. This defines which imports get replaced. It means: for every import of X, X being a subdirectory of `<dir>`, replace it with an import of `<module>/X`.

* `warnOnDynamicImport`. There are some cases where this rule can't figure out if an import should be replaced or not, namely dynamic imports (e.g.: `require(path+'/thing')`. If this property is `true`, it will print out a warning when those imports are found.
				
