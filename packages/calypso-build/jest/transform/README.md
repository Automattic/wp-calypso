# Jest Transforms

## Assets

Jest would fail when trying to import asset files that it cannot parse,
i.e. they're not plain JavaScript:

```jsx
const MyFlag = ( { countryCode } ) => (
	<img alt="" src={ require( `flags/${ countryCode }.svg` ).default } />
);
```

This helper can be used to transform all those imports to a module that returns
the asset file's basename as a string:

```js
const config = {
	transform: {
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': require.resolve(
			'@automattic/calypso-build/jest/transform/asset.js'
		),
	},
};
```

## Babel

A babel transform for Jest so it can correctly process JSX, TypeScript, etc.

```js
const config = {
	transform: {
		'\\.[jt]sx?$': require.resolve( '@automattic/calypso-build/jest/transform/babel.js' ),
	},
};
```
