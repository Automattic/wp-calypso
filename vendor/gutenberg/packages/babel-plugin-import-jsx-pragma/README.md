Babel Plugin Import JSX Pragma
======

Babel transform plugin for automatically injecting an import to be used as the pragma for the [React JSX Transform plugin](http://babeljs.io/docs/en/babel-plugin-transform-react-jsx).

[JSX](https://reactjs.org/docs/jsx-in-depth.html) is merely a syntactic sugar for a function call, typically to `React.createElement` when used with [React](https://reactjs.org/). As such, it requires that the function referenced by this transform be within the scope of the file where the JSX occurs. In a typical React project, this means React must be imported in any file where JSX exists.

**Babel Plugin Import JSX Pragma** automates this process by introducing the necessary import automatically wherever JSX exists, allowing you to use JSX in your code without thinking to ensure the transformed function is within scope.

## Installation

Install the module to your project using [npm](https://www.npmjs.com/).

```bash
npm install @wordpress/babel-plugin-import-jsx-pragma
```

## Usage

Refer to the [Babel Plugins documentation](http://babeljs.io/docs/en/plugins) if you don't yet have experience working with Babel plugins.

Include `@wordpress/babel-plugin-import-jsx-pragma` (and [@babel/transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx/)) as plugins in your Babel configuration. If you don't include both you will receive errors when encountering JSX tokens.

```js
// .babelrc.js
module.exports = {
	plugins: [
		'@wordpress/babel-plugin-import-jsx-pragma',
		'@babel/transform-react-jsx',
	],
};
```

## Options

As the `@babel/transform-react-jsx` plugin offers options to customize the `pragma` to which the transform references, there are equivalent options to assign for customizing the imports generated.

For example, if you are using the `@wordpress/element` package, you may want to use the following configuration:

```js
// .babelrc.js
module.exports = {
	plugins: [
		[ '@wordpress/babel-plugin-import-jsx-pragma', {
			scopeVariable: 'createElement',
			source: '@wordpress/element',
			isDefault: false,
		} ],
		[ '@babel/transform-react-jsx', {
			pragma: 'createElement',
		} ],
	],
};
```

### `scopeVariable`

_Type:_ String

Name of variable required to be in scope for use by the JSX pragma. For the default pragma of React.createElement, the React variable must be within scope.

### `source`

_Type:_ String

The module from which the scope variable is to be imported when missing.

### `isDefault`

_Type:_ Boolean

Whether the scopeVariable is the default import of the source module.

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
