# eslint-plugin-wpcalypso

Custom ESLint rules for the [WordPress.com Calypso project](https://github.com/automattic/wp-calypso).

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm install eslint --save-dev
```

Next, install `eslint-plugin-wpcalypso`:

```
$ npm install eslint-plugin-wpcalypso --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-wpcalypso` globally.

## Usage

Add `wpcalypso` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "wpcalypso"
    ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "wpcalypso/rule-name": 2
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
- [`import-docblock`](docs/rules/import-docblock.md): Enforce external, internal dependencies docblocks
- [`post-message-no-wildcard-targets`](docs/rules/post-message-no-wildcard-targets.md): Disallow using the wildcard '*' in `postMessage`
- [`import-no-redux-combine-reducers`](docs/rules/import-no-redux-combine-reducers.md): Disallow combineReducers import from redux
- [`redux-no-bound-selectors`](docs/rules/redux-no-bound-selectors.md): Disallow creation of selectors bound to Redux state

# Config

An ESLint configuration following WordPress.com's "Calypso" [JavaScript Coding Guidelines](https://github.com/Automattic/wp-calypso/blob/master/docs/coding-guidelines/javascript.md).

## Usage

You should install this configuration and peer dependencies as `devDependencies` in your project:

```
npm install --save-dev eslint-config-wpcalypso eslint eslint-plugin-wpcalypso
```

If you're planning to use the React superset of rules, you should also install `eslint-plugin-react`:

```
npm install --save-dev eslint-plugin-react
```

Next, simply extend the configuration from your project's `.eslintrc` file:

```
"extends": "wpcalypso"
```

Or, if your project uses React and you want to opt in to additional React-specific rules, extend the React superset:

```
"extends": "wpcalypso/react"
```

Refer to the [ESLint documentation on Shareable Configs](http://eslint.org/docs/developer-guide/shareable-configs) for more information.

## Suggesting Changes to config

Want to suggest a change to our style guide? [Edit the JavaScript Coding Guidelines on the Automattic/wp-calypso repository](https://github.com/Automattic/wp-calypso/edit/master/docs/coding-guidelines/javascript.md) and submit a pull request.

Want to revise the ESLint rules used here? [Edit the `index.js` file](https://github.com/Automattic/eslint-config-wpcalypso/edit/master/index.js) and submit a pull request.

## License

[GNU General Public License v2.0 or later](https://spdx.org/licenses/GPL-2.0-or-later.html).
