## 0.1.1

- Add lodash replacements so consumers can drop that dependency: `camelCase`, `capitalize`, `defaults`, `escapeRegExp`, `flow`, `groupBy`, `isEmpty`, `isError`, `kebabCase`, `mapKeys`, `mapValues`, `maxBy`, `memoize`, `merge`, `mergeWith`, `minBy`, `omit`, `omitBy`, `once`, `orderBy`, `partition`, `pick`, `pickBy`, `random`, `range`, `set`, `snakeCase`, `sortBy`, `times`, `truncate`, and `uniqBy`.
- Resolve the `import` condition to the CommonJS build. The ESM output uses extensionless specifiers and the package is not `type: module`, so native ESM could not load it.
- Restore the `tslib` dependency, which the CommonJS output requires.

## 0.1.0

- Add `uniqueBy`
- Add `shuffle`
