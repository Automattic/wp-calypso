# Eslint config wpcalypso

An ESLint configuration following WordPress.com's "Calypso" [JavaScript Coding Guidelines](https://github.com/Automattic/wp-calypso/blob/master/docs/coding-guidelines/javascript.md).

## Usage

You should install this configuration and peer dependencies as `devDependencies` in your project:

```
yarn add --dev eslint-config-wpcalypso eslint eslint-plugin-wpcalypso
```

If you're planning to use the React superset of rules, you should also install `eslint-plugin-react`:

```
yarn add --dev eslint-plugin-react
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

## Suggesting Changes

Want to suggest a change to our style guide? [Edit the JavaScript Coding Guidelines on the Automattic/wp-calypso repository](https://github.com/Automattic/wp-calypso/edit/master/docs/coding-guidelines/javascript.md) and submit a pull request.

Want to revise the ESLint rules used here? [Edit the `index.js` file](https://github.com/Automattic/eslint-config-wpcalypso/edit/master/index.js) and submit a pull request.

## License

[GNU General Public License v2.0 or later](https://spdx.org/licenses/GPL-2.0-or-later.html).
