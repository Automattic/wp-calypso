# Async Load

`<AsyncLoad />` is a React component intended for use in loading modules on-demand. Combined with the [`transform-wpcalypso-async` Babel plugin](https://github.com/Automattic/wp-calypso/blob/HEAD/packages/babel-plugin-transform-wpcalypso-async) and [Webpack code splitting](https://webpack.github.io/docs/code-splitting.html), it offers an easy mechanism for creating new bundles to be loaded asynchronously.

## Usage

Pass with a `require` string for the module path to be loaded:

```jsx
<AsyncLoad require="calypso/components/async-load" />;
```

Depending on the environment configuration, this will be transformed automatically into either a `require` or `require.ensure` call.

See [`babel-plugin-transform-wpcalypso-async` documentation](https://github.com/Automattic/wp-calypso/blob/HEAD/packages/babel-plugin-transform-wpcalypso-async) for more information.

## Props

The following props can be passed to the AsyncLoad component:

| property      | type              | required | comment                                                                                                                                                                                                                                                                                             |
| ------------- | ----------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `require`     | String (Function) | yes      | In general usage, this should be passed as a string of the module to be imported. During build, the string prop is [transformed to a function](https://github.com/Automattic/wp-calypso/blob/HEAD/packages/babel-plugin-transform-wpcalypso-async) which is called to require the specified module. |
| `placeholder` | PropTypes.node    | no       | A placeholder to be shown while the module is being asynchronously required. If omitted, a default placeholder will be shown. If `null` is provided, then no placeholder is shown.                                                                                                                  |
