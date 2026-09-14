## 0.1.1

- Add lodash replacements so consumers can drop that dependency: `camelCase`, `capitalize`, `defaults`, `escapeRegExp`, `flow`, `groupBy`, `isEmpty`, `isError`, `kebabCase`, `mapKeys`, `mapValues`, `maxBy`, `memoize`, `merge`, `mergeWith`, `minBy`, `omit`, `omitBy`, `once`, `orderBy`, `partition`, `pick`, `pickBy`, `random`, `range`, `set`, `snakeCase`, `sortBy`, `times`, `truncate`, and `uniqBy`.
- Drop the `exports` map, restoring the resolution the published 0.1.0 has. Its `import` condition pointed at an ESM build that native Node cannot load, since the output uses extensionless specifiers and the package is not `type: module`. `main` and `module` keep Node on CommonJS and bundlers on ESM.
- Build `pick` and `omit` results with own data properties, so an own `__proto__` key in the source is copied as data instead of setting the result prototype.
- Stop publishing `src/test` and TypeScript build info, matching the `files` allowlist `@automattic/date-range-picker` already uses.
- Restore the `tslib` dependency, which the CommonJS output requires.

## 0.1.0

- Add `uniqueBy`
- Add `shuffle`
