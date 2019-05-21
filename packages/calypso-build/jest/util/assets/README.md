# Mocks asset imports in JS

Jest would fail when trying to import asset files that it cannot parse,
i.e. they're not plain JavaScript:

```jsx
const MyFlag = ( { countryCode } ) => (
	<img alt="" src={ require( `flags/${ countryCode }.svg` ) } />
);
```

This helper can be used to transform all those imports to a module that returns
the asset file's basename as a string:

```js
{
	transform: {
		'^.+\\.jsx?$': 'babel-jest',
		'\\.svg$': require.resolve(
			'@automattic/calypso-build/jest/util/assets/transform.js'
		)
	},
}
```
