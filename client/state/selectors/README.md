# State Selectors

This folder contains all available state selectors. Each file includes a single default exported function which can be used as a helper in retrieving derived data from the global state tree.

To learn more about selectors, refer to the ["Our Approach to Data" document](../../../docs/our-approach-to-data.md#selectors).

When adding a new selector to this directory, make note of the following details:

- Each new selector exists in its own file, named with [kebab case](https://en.wikipedia.org/wiki/Kebab_case) (dash-delimited lowercase)
- There should be no more than a single default exported function per selector file
- Tests for each selector should exist in the [`test/` subdirectory](./test) with matching file name of the selector

To import specific selectors, use the exact path, which leverages the Babel "transform-imports" plugin to transform the import to its individual file:

```javascript
import getSite from 'calypso/state/selectors/get-site';
```
