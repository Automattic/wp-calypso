# Browserslist Config

WordPress.com shareable config for [Browserslist](https://www.npmjs.com/package/browserslist).

## Installation

Install the module

```shell
$ npm install browserslist @automattic/browserslist-config --save-dev
```

## Usage

Add this to your `package.json` file:

```json
"browserslist": [
	"extends @automattic/browserslist-config"
]
```

Alternatively, add this to `.browserslistrc` file:

```
extends @automattic/browserslist-config
```

This package when imported returns an array of supported browsers, for more configuration examples including Autoprefixer, Babel, ESLint, PostCSS, and stylelint see the [Browserslist examples](https://github.com/ai/browserslist-example#browserslist-example) repo.
