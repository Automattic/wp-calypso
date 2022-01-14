# @automattic/eslint-plugin-json

This ESLint plugin is a collection of plugins, rules and configurations that help lint JSON files, with special support for `package.json`

## Usage

Add an override in your ESLint config:

```js
module.exports = {
	//...
	overrides: [
		{
			files: [ '*.json' ],
			extends: [ 'plugin:@automattic/eslint-plugin-json/wpcom' ],
			rules: {
				// Custom rules
			},
		},
	],
};
```

There are two configs to extend from:

- `plugin:@automattic/eslint-plugin-json/recommended`: default set of settings. Includes

  - [`eslint-plugin-json-es` recommended rules](https://github.com/zeitport/eslint-plugin-json-es#recommended)
  - Disable `comma-dangle` and forbid comments
  - [`npm-package-json-lint` default rules](https://github.com/tclindner/npm-package-json-lint-config-default)

- `plugin:@automattic/eslint-plugin-json/wpcom`: rules from Gutenberg. Includes:
  - All of the above
  - [`@wordpress/npm-package-json-lint-config` rules](https://www.npmjs.com/package/@wordpress/npm-package-json-lint-config)

## Linting JSON files

Internally, we use the plugin [`eslint-plugin-json-es`](https://www.npmjs.com/package/eslint-plugin-json-es) which transforms JSON into valid JavaScript so it can be linted with regular ESLint rules. It includes a few [recommended rules](https://github.com/zeitport/eslint-plugin-json-es#recommended), which are enabled in our `recommended` config.

Our `recommended` config also disables `comma-dangle` and `json-es/no-comments`, as they are not valid in strict JSON. If you want to allow comments in some JSON files, we recommend this config:

```js
module.exports = {
	//...
	overrides: [
		{
			files: [ '*.json' ],
			extends: [ 'plugin:@automattic/eslint-plugin-json/wpcom' ],
			overrides: [
				{
					// These files are parsed as jsonc (JSON with Comments)
					// Customize the files array as needed
					files: [ 'tsconfig.json' ],
					rules: {
						'json-es/no-comments': 'off',
					},
				},
			],
		},
	],
};
```

Using that config, ESLint won't allow comments in `.json` files, except for `tsconfig.json`.

## Linting package.json

It is recommended to add another overrides within the `.json` overrides to configure `package.json` specific rules:

```js
module.exports = {
	//...
	overrides: [
		{
			files: [ '*.json' ],
			extends: [ 'plugin:@automattic/eslint-plugin-json/wpcom' ],
			rules: {
				// General rules for all .json files
			},
			overrides: [
				{
					files: [ 'package.json' ],
					rules: {
						// Specific rules for package.json files
					},
				},
			],
		},
	],
};
```

We have an adapter to use all rules from [`npm-package-json-lint`](https://npmpackagejsonlint.org/docs/en/rules) as ESLint rules. For example, the rule [`require-author`](https://npmpackagejsonlint.org/docs/en/rules/required-node/require-author) is exposed as the ESLint rule `@automattic/json/require-author`. You can use this mapping to enable, disable and configure rules as needed. Example:

```js
module.exports = {
	//...
	overrides: [
		{
			files: [ 'package.json' ],
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
	],
};
```
