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
