# @automattic/eslint-plugin-json

This ESLint plugin is a collection of plugins, rules and configurations that help lint JSON files, with special support for `package.json`

## Usage

Requires ESLint 10.13 or later within 10.x. In `eslint.config.mjs`, apply `recommended` to your JSON files, using `files` and `extends` as shown below. Always set `files`: the preset doesn't pick files itself, so without `files`, it would also run on JavaScript files. The preset registers a wrapped `eslint-plugin-json-es`, so don't register that plugin yourself.

```js
import json from '@automattic/eslint-plugin-json';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	{
		files: [ '**/*.json' ],
		extends: [ json.configs.recommended ],
	},
] );
```

`recommended` includes:

- [`eslint-plugin-json-es` recommended rules](https://github.com/zeitport/eslint-plugin-json-es#recommended)
- Disable `comma-dangle` and forbid comments
- [`npm-package-json-lint` default rules](https://github.com/tclindner/npm-package-json-lint-config-default), for `package.json` files

## Linting JSON files

Internally, we use the plugin [`eslint-plugin-json-es`](https://www.npmjs.com/package/eslint-plugin-json-es) which transforms JSON into valid JavaScript so it can be linted with regular ESLint rules. It includes a few [recommended rules](https://github.com/zeitport/eslint-plugin-json-es#recommended), which are enabled in our `recommended` config.

Our `recommended` config also disables `comma-dangle` and `json-es/no-comments`, as they are not valid in strict JSON. If you want to allow comments in some JSON files, we recommend this config:

```js
export default defineConfig( [
	{
		files: [ '**/*.json' ],
		extends: [ json.configs.recommended ],
	},
	{
		// These files are parsed as jsonc (JSON with Comments)
		// Customize the files array as needed
		files: [ '**/tsconfig.json' ],
		rules: {
			'json-es/no-comments': 'off',
		},
	},
] );
```

Using that config, ESLint won't allow comments in `.json` files, except for `tsconfig.json`.

## Linting package.json

We have an adapter to use all rules from [`npm-package-json-lint`](https://npmpackagejsonlint.org/docs/en/rules) as ESLint rules. For example, the rule [`require-author`](https://npmpackagejsonlint.org/docs/en/rules/required-node/require-author) is exposed as the ESLint rule `@automattic/json/require-author`. You can use this mapping to enable, disable and configure rules as needed. Example:

```js
export default defineConfig( [
	{
		files: [ '**/*.json' ],
		extends: [ json.configs.recommended ],
	},
	{
		files: [ '**/package.json' ],
		rules: {
			// Require bugs URL
			'@automattic/json/require-bugs': 'error',

			// Do not require author
			'@automattic/json/require-author': 'off',

			// Configure description format
			'@automattic/json/description-format': [
				'error',
				{
					requireCapitalFirstLetter: true,
					requireEndingPeriod: true,
				},
			],
		},
	},
] );
```
