# Eslint plugin wpcalypso

An ESLint configuration following WordPress.com's "Calypso" [JavaScript Coding Guidelines][2].
This package also includes custom ESLint rules for the [WordPress.com Calypso project][1]

## Installation

Install [ESLint](http://eslint.org) and `eslint-plugin-wpcalypso`

```
$ yarn add --dev eslint eslint-plugin-wpcalypso
```

If you're planning to use the React superset of rules, you should also install `eslint-plugin-react` and `eslint-plugin-react-hooks`:

```
yarn add --dev eslint-plugin-react eslint-plugin-react-hooks
```

## Usage

### Recommended rules

Simply extend the configuration from your project's `.eslintrc` configuration file:

```json
{
	"extends": [ "plugin:wpcalypso/recommended" ]
}
```

Or, if your project uses React and you want to opt in to additional React-specific rules, extend the React superset:

```json
{
	"extends": [ "plugin:wpcalypso/react" ]
}
```

**ESLint 9 flat config.** In `eslint.config.js`, apply `flat/react` (or `flat/recommended`) to your JavaScript files, using `files` and `extends` as shown below. Always set `files`: the presets don't pick files themselves, so without it they would also run on JSON or Markdown files.

Requires ESLint 9.22+ (for `extends`). ESLint 10 isn't supported yet: the Babel parser needs Babel 8 there, and `eslint-plugin-react` doesn't list ESLint 10 as a peer yet. On ESLint 10, the presets register a wrapped `eslint-plugin-inclusive-language`, so don't register that plugin yourself there.

```js
const { defineConfig } = require( 'eslint/config' );
const wpcalypso = require( 'eslint-plugin-wpcalypso' );

module.exports = defineConfig( [
	{
		files: [ '**/*.{js,jsx}' ],
		extends: [ wpcalypso.configs[ 'flat/react' ] ], // or 'flat/recommended'
	},
] );
```

Any of the above options will:

- Enable the plugin `wpcalypso`
- Enable the recommended set of rules to match WordPress.com's "Calypso" [JavaScript Coding Guidelines][2]
- Enable custom rules used for [WordPress.com Calypso project][1]

### Custom rules

If you are not interesetd in the recommended set of rules but only on some of the custom rules, you can enable them individually.

First, add `wpcalypso` to the plugins section of your `.eslintrc` configuration file:

```json
{
	"plugins": [ "wpcalypso" ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
	"rules": {
		"wpcalypso/rule-name": "error"
	}
}
```

## Supported Rules

- [`i18n-ellipsis`](docs/rules/i18n-ellipsis.md): Disallow using three dots in translate strings
- [`i18n-mismatched-placeholders`](docs/rules/i18n-mismatched-placeholders.md): Ensure placeholder counts match between singular and plural strings
- [`i18n-named-placeholders`](docs/rules/i18n-named-placeholders.md): Disallow multiple unnamed placeholders
- [`i18n-no-collapsible-whitespace`](docs/rules/i18n-no-collapsible-whitespace.md): Disallow collapsible whitespace in translatable strings
- [`i18n-no-placeholders-only`](docs/rules/i18n-no-placeholders-only.md): Disallow strings which include only placeholders
- [`i18n-no-this-translate`](docs/rules/i18n-no-this-translate.md): Disallow this.translate()
- [`i18n-no-variables`](docs/rules/i18n-no-variables.md): Disallow variables as translate strings
- [`jsx-classname-namespace`](docs/rules/jsx-classname-namespace.md): Ensure JSX className adheres to CSS namespace guidelines
- [`jsx-gridicon-size`](docs/rules/jsx-gridicon-size.md): Enforce recommended Gridicon size attributes
- [`no-import-lodash`](docs/rules/no-import-lodash.md): Disallow importing lodash
- [`post-message-no-wildcard-targets`](docs/rules/post-message-no-wildcard-targets.md): Disallow using the wildcard '\*' in `postMessage`
- [`redux-no-bound-selectors`](docs/rules/redux-no-bound-selectors.md): Disallow creation of selectors bound to Redux state

## Suggesting Changes

Want to suggest a change to our style guide? [Edit the JavaScript Coding Guidelines on the Automattic/wp-calypso repository](https://github.com/Automattic/wp-calypso/edit/trunk/docs/coding-guidelines/javascript.md) and submit a pull request.

Want to revise the ESLint rules used here? [Edit the `recommended.js` file](https://github.com/Automattic/eslint-plugin-wpcalypso/edit/trunk/libs/configs/recommended.js) and submit a pull request.

## License

[GNU General Public License v2.0 or later](https://spdx.org/licenses/GPL-2.0-or-later.html).

[1]: https://github.com/automattic/wp-calypso
[2]: https://github.com/Automattic/wp-calypso/blob/HEAD/docs/coding-guidelines/javascript.md
