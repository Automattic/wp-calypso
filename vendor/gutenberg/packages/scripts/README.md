# @wordpress/scripts

A collection of JS scripts for WordPress development.

## Installation

Install the module

```bash
npm install @wordpress/scripts --save-dev
```

## Setup

This is a CLI and exposes a binary called `wp-scripts` so you can call it directly. However this module is designed to be configured using the `scripts` section in the `package.json` file of your project.

_Example:_

```json
{
	"scripts": {
		"lint:pkg-json": "wp-scripts lint-pkg-json .",
		"test": "wp-scripts test-unit-js"
	}
}
```

## Available Scripts

### `wp-scripts lint-pkg-json`

Helps enforce standards for your package.json file. It uses [npm-package-json-lint](https://www.npmjs.com/package/npm-package-json-lint) with the set of default rules provided. You can override them with your own rules as described in [npm-package-json-lint wiki](https://github.com/tclindner/npm-package-json-lint/wiki).

_Example:_

```json
{
	"scripts": {
		"lint:pkg-json": "wp-scripts lint-pkg-json ."
	}
}
```

This is how you execute those scripts using the presented setup:
* `npm run lint:pkg-jsont` - lints `package.json` file in the project's root folder.

### `wp-scripts test-unit-js`

_Alias_: `wp-scripts test-unit-jest` 

Launches the test runner. It uses [Jest](https://facebook.github.io/jest/) behind the scenes and you are able to utilize all of its [CLI options](https://facebook.github.io/jest/docs/en/cli.html). You can also run `./node_modules/.bin/wp-scripts test-unit-js --help` or `npm run test:help` (as presented below) to view all of the available options.

_Example:_

```json
{
	"scripts": {
		"test": "wp-scripts test-unit-js",
		"test:help": "wp-scripts test-unit-js --help",
		"test:watch": "wp-scripts test-unit-js --watch"
	}
}
```

This is how you execute those scripts using the presented setup:
* `npm run test` or `npm test` - runs all unit tests.
* `npm run test:help` - prints all available options to configure unit tests runner.
* `npm run test:watch` - runs all unit tests in the watch mode.

## Inspiration

This is inspired by [react-scripts](https://www.npmjs.com/package/react-scripts) and [kcd-scripts](https://www.npmjs.com/package/kcd-scripts).

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
