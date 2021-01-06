# EmptyComponent

Useful for stubbing out components that will not build on the server when rendering server-side.

## How to use

In the webpack server [config file](/webpack.config.node.js):

```js
const config = {
	plugins: [
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/my-sites\/themes\/thanks-modal$/,
			'calypso/components/empty-component'
		), // Depends on BOM
	],
};
```

In the above example, on the server build, any occurrences of `/my-sites/themes/thanks-modal` will be replaced with the empty component.
