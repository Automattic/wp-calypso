# Disallow importing lodash (`no-import-lodash`)

lodash has been removed from the wp-calypso codebase in favor of native
JavaScript and helpers from `@automattic/js-utils`. This rule prevents it from
being reintroduced.

It reports every way of naming the `lodash`, `lodash/<fn>`, and per-method
`lodash.<fn>` packages — a static `import`, a re-export (`export … from`), a
dynamic `import()`, a CommonJS `require()`, a TypeScript `import x = require()`,
and a TypeScript import-type query (`type X = import('lodash').Foo`). The
tree-shakeable `lodash-es` replacement is not affected.

`require.resolve( 'lodash' )` is intentionally allowed: it resolves a module
path (build tooling relies on this) without importing or executing lodash.

This rule is not part of `plugin:wpcalypso/recommended`; it encodes a
wp-calypso-specific policy and is enabled in the repository's root config.

## Rule Details

Examples of **incorrect** code for this rule:

```js
import _ from 'lodash';
import merge from 'lodash/merge';
export * from 'lodash';
const mergeWith = require( 'lodash.mergewith' );
```

Examples of **correct** code for this rule:

```js
import { debounce } from 'lodash-es';
const lodashPath = require.resolve( 'lodash/lodash.js' );
```
