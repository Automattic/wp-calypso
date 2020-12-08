# NullComponent

Useful for stubbing out components that will not build on the server when rendering server-side.

## How to use

In the webpack server [config file](/webpack.config.node.js):

```js
const config = {
	plugins: [
		new webpack.NormalModuleReplacementPlugin(
			/^components\/popover$/,
			'components/null-component'
		),
	],
};
```

In the above example, on the server build, any occurrences of `/client/components/popover` will be replaced with the react generated string comment indicating that nothing was rendered.
