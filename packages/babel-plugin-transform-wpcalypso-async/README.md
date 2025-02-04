# Calypso Async Babel Transform Plugin

`babel-plugin-transform-wpcalypso-async` is a Babel plugin to facilitate optional
code-splitting by applying transformations to a `asyncRequire` global function or the
[`<AsyncLoad />` React component](https://github.com/Automattic/wp-calypso/tree/HEAD/client/components/async-load).

## Usage

Include in your Babel configuration as a plugin.

Example Babel config file:

```json
{
	"plugins": [ "@automattic/transform-wpcalypso-async" ]
}
```

See [Babel options documentation](http://babeljs.io/docs/usage/options/) for more information.

## Transformations

`asyncRequire` will transform to one of:

- dynamic `import()` if the `ignore` plugin option is not `true`
- a rejected `Promise` that throws an error that the import is ignored, if the `ignore` plugin option is `true`

`asyncRequire` expects one required argument, the name of the imported module.

```js
asyncRequire( 'calypso/components/search' ).then( ( { default: Search } ) => {
	console.log( Search );
} );
```

`<AsyncLoad />` will transform its `require` string prop to a function invoking a dynamic `import`, or throwing an error when the `ignore` option is enabled.

```js
// Before:

<AsyncLoad require="calypso/components/search" />;
```

```js
// After:
const ref = () => import( 'calypso/components/search' );

<AsyncLoad require={ ref } />;
```

## Options

- `ignore` - if set to `true`, the `asyncRequire` call will be returning a rejected `Promise`, and `AsyncLoad` will show the placeholder forever and won't do any import. Useful for server side rendering where the render is one-pass and doesn't wait for any imports to finish.
