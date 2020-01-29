Performance
===========

- React Docs: [Optimizing Performance](https://reactjs.org/docs/optimizing-performance.html)
- [Debugging React performance with React 16 and Chrome Devtools](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad)
- Chrome DevTools Docs: [Analyze Runtime Performance](https://developers.google.com/web/tools/chrome-devtools/rendering-tools/)

## Bundle Analysis

### Why is X bundled?

If you want to know why a certain module is bundled you can use `whybundled` to find out. See the following for an example on usage:

```sh
yarn run preanalyze-bundles
yarn run whybundled -- [module]

npn run whybundled -- is-my-json-valid
```

This should give you an overview on where this module got bundled and which file are requiring it:

```
MODULE  is-my-json-valid
├─ imported: 13 times
├─ deps count: 5
├─ size: 19 KiB [for all included files]
├─ type: [direct]
├─ chunks: vendors~build
├─ locations:
│  └─ ./node_modules/is-my-json-valid/
│
├─ files:
│  ├─ ./node_modules/is-my-json-valid/formats.js
│  └─ ./node_modules/is-my-json-valid/index.js
│
└─ reasons:
  ├─ ./client/extensions/woocommerce/index.js + 439 modules  7:0-41  [harmony side effect evaluation]
  ├─ [...]
```
