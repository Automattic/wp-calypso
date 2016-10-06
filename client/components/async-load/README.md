Async Load
==========

`<AsyncLoad />` is a React component intended for use in loading modules on-demand. Combined with the [`transform-wpcalypso-async` Babel plugin](https://github.com/Automattic/babel-plugin-transform-wpcalypso-async) and [Webpack code splitting](https://webpack.github.io/docs/code-splitting.html), it offers an easy mechanism for creating new bundles to be loaded asynchronously.

## Usage

Pass with a `require` string for the module path to be loaded:

```jsx
<AsyncLoad require="components/async-load" />
```

Depending on the environment configuration, this will be transformed automatically into either a `require` or `require.ensure` call.

See [`babel-plugin-transform-wpcalypso-async` documentation](https://github.com/Automattic/babel-plugin-transform-wpcalypso-async) for more information.
