# Calypso Async Babel Transform Plugin

`babel-plugin-transform-wpcalypso-async` is a Babel plugin to facilitate optional
code-splitting by applying transformations to a `asyncRequire` global function or the
[`<AsyncLoad />` React component](https://github.com/Automattic/wp-calypso/tree/HEAD/client/components/async-load).

## Usage

Include in your Babel configuration as a plugin.

Example Babel config file:

```json
{
	"plugins": [
		[ "@automattic/transform-wpcalypso-async", { "async": true } ]
	]
}
```

See [Babel options documentation](http://babeljs.io/docs/usage/options/) for more information.

## Transformations

`asyncRequire` will transform to one of:

- dynamic `import()` if `async` plugin option is `true`
- static `require` if `async` plugin option is `false` or unset
- nothing (will be removed and no module will be imported) if the `ignore` plugin option is `true`

`asyncRequire` expects one required argument, with an optional callback:

```js
asyncRequire( 'calypso/components/search', ( Search ) => {
	console.log( Search );
} );
```

`<AsyncLoad />` will transform its `require` string prop to a function invoking `asyncRequire` when called.

```js
// Before:

<AsyncLoad require="calypso/components/search" />;
```

```js
// After:

<AsyncLoad
	require={ function ( callback ) {
		asyncRequire( 'calypso/components/search', callback );
	} }
/>;
```

## Options

- `async` - controls whether transformations applied by the plugin should use a dynamic ESM `import` statement that enables [webpack code-splitting](https://webpack.github.io/docs/code-splitting.html) or the synchronous CommonJS `require` function. This defaults to `false`.
- `ignore` - if set to `true`, the `asyncRequire` call will be completely removed, and `AsyncLoad` will show the placeholder forever and won't do any import. Useful for server side rendering where the render is one-pass and doesn't wait for any imports to finish.
