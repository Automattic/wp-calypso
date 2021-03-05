# Forbid package-relative imports

When importing modules, we support importing them relative to `./client` but using a absolute syntax:

```js
import config from 'config';
import userFactory from 'lib/user';
```

Those work because Webpack will search for those modules in ./client first, and then in node_modules (so the example above gets resolved as ./client/config and ./client/lib/user). The current approach has some problems, namely having to configure every module resolution (webpack, node.js, typescript, IDEs...) to understand and follow that pattern.

As an alternative, we can rewrite the above as

```js
import config from '@automattic/calypso-config';
import userFactory from 'calypso/lib/user';
```

Which works because `calypso` is a valid package in our repository, points to `./client` and is declared as a dependency in the root `package.json`. This will work out of the box in all module resolution systems.

This rule forbids the former approach and can auto-fix it to the latter.

## Rule Details

The following patterns are considered incorrect:

```jsx
import config from 'config';
import * as stats from 'reader/stats';
import { localizeUrl } from 'lib/i18n-utils';
export { default as ActionCard } from 'components/action-card/docs/example';
export * from 'components/AppBar';
const config1 = require( 'config' );
const config2 = asyncRequire( 'config' );

const component = <AsyncLoad require="config" />;
```

The following patterns are correct

```jsx
import config from '@automattic/calypso-config';
import * as stats from 'calypso/reader/stats';
import { localizeUrl } from 'calypso/lib/i18n-utils';
export { default as ActionCard } from 'calypso/components/action-card/docs/example';
export * from 'calypso/components/AppBar';
const config1 = require( '@automattic/calypso-config' );
const config2 = asyncRequire( '@automattic/calypso-config' );

const component = <AsyncLoad require="@automattic/calypso-config" />;

import config3 from './config';
import config4 from '../../../config';
import config5 from 'dirA'; //when `dirA` is not a directory or file in ./client/
```

## Configuration

The rule accept a configuration object with:

- `mappings`. An array of objects like `{dir: string, module: string}`. This defines which imports get replaced. It means: for every import of X, X being a subdirectory or file of `<dir>`, replace it with an import of `<module>/X`.

- `automaticExtensions`. An array with the list of extensions to try to import automatically. For example, `['.js', '.json', '.ts']`. This means that when the rule finds something like `import 'file'`, it will apply the mappings if `file.js`, `file.json`, or `file.ts` are files in `<dir>`

- `warnOnNonLiteralImport`. There are some cases where this rule can't figure out if an import should be replaced or not, namely non-literal imports (e.g.: `require(path+'/thing')`. If this property is `true`, it will print out a warning when those imports are found.
