Calypso Async Babel Transform Plugin
====================================

`babel-plugin-transform-wpcalypso-async` is a Babel plugin to facilitate optional code-splitting by applying transformations to a `asyncRequire` global function or the [`<AsyncLoad />` React component](https://github.com/Automattic/wp-calypso/tree/master/client/components/async-load).

## Usage

Include in your Babel configuration as a plugin.

Example `.babelrc` file:

```json
{
	"plugins": [
		[ "./server/babel/babel-plugin-transform-wpcalypso-async", { "async": true } ]
	]
}
```

See [Babel options documentation](http://babeljs.io/docs/usage/options/) for more information.

## Transformations

`asyncRequire` will transform to one of:
- `require.ensure` if `async` plugin option is true
- `require` if `async` plugin option is false or unset

`asyncRequire` expects one required argument, with an optional callback:

```js
asyncRequire( 'components/accordion', ( Accordion ) => {
	console.log( Accordion );
} );
```

`<AsyncRequire />` will transform its `require` string prop to a function invoking `asyncRequire` when called.

```js
// Before:

<AsyncLoad require="components/accordion" />

// After:

<AsyncLoad require={ function( callback ) { 
	asyncRequire( 'components/accordion', callback );
} } />
```

## Options

The plugin accepts a single option, `async`, which controls whether transformations applied by the plugin should should [Webpack code-splitting `require.ensure`](https://webpack.github.io/docs/code-splitting.html) or the synchronous CommonJS `require` function. This defaults to `false`.
