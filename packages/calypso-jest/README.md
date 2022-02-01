# @automattic/calypso-jest

This package provides a Jest preset used to run tests in Calypso. In your `jest.config.js` set the following:

```js
module.exports = {
	preset: '@automattic/calypso-jest',
};
```

Major features:

- Sets up Enzyme with React 17
- Find tests under `<rootDir>` inside `test` folder. Valid extensions are `.ts`, `.js`, `.tsx`, `.jsx`
- Can use `calypso:src` from `package.json` to resolve a package
- Can use conditional exports

## Assets transformer

Jest would fail when trying to import asset files that it cannot parse,
i.e. they're not plain JavaScript:

```jsx
const MyFlag = ( { countryCode } ) => (
	<img alt="" src={ require( `flags/${ countryCode }.svg` ).default } />
);
```

This packages includes a transfomer that be used to transform all those imports to a module that returns
the asset file's basename as a string:

```js
const config = {
	transform: {
		'\\.(gif|jpg|jpeg|png|svg|scss|sass|css)$': require.resolve(
			'@automattic/calypso-jest/asset-transform.js'
		),
	},
};
```
