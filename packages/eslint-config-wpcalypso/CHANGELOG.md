#### v0.6.0 (2016-10-21)

- General: Update to `eslint-plugin-wpcalypso@3.0.1` ([see changelog](https://github.com/Automattic/eslint-plugin-wpcalypso/blob/master/CHANGELOG.md#v301-2016-10-21))
- Added: [`wpcalypso/i18n-no-collapsible-whitespace`](https://github.com/Automattic/eslint-plugin-wpcalypso/blob/master/docs/rules/i18n-no-collapsible-whitespace.md) as error
- Added: [`wpcalypso/i18n-no-this-translate`](https://github.com/Automattic/eslint-plugin-wpcalypso/blob/master/docs/rules/i18n-no-this-translate.md) as error
- Added: [`wpcalypso/import-docblock`](https://github.com/Automattic/eslint-plugin-wpcalypso/blob/master/docs/rules/import-docblock.md) as error
- Added: [`react/prefer-es6-class`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-es6-class.md) as error
- Added: [`func-call-spacing`](http://eslint.org/docs/rules/func-call-spacing) as error ("never")

#### v0.5.0 (2016-08-29)

- Added: [`react/jsx-space-before-closing`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-space-before-closing.md) enforces a space before closing brackets in self-closing JSX elements (this only applies to the React superset of rules)

#### v0.4.0 (2016-08-25)

- Added: [`react/jsx-no-target-blank`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md) prevents unsafe `target="_blank"` usage
- General: Define `files` in `package.json` to omit development files

#### v0.3.0 (2016-08-24)

- Added: [`template-curly-spacing`](http://eslint.org/docs/rules/template-curly-spacing) now enforces spaces within template strings
- General: ESLint peer dependency bumped from ^2.13.1 to ^3.3.1
- General: `eslint-plugin-wpcalypso` dependency bumped from ^1.3.2 to ^2.0.0

#### v0.2.0 (2016-07-06)

- Removed: `wpcalypso/no-lodash-import` rule dropped in favor of alternatives to enable optimized Lodash imports (see [Automattic/wp-calypso#6539](https://github.com/Automattic/wp-calypso/pull/6539)). It's expected that this will be removed from `eslint-plugin-wpcalypso` in a future major release.

#### v0.1.0 (2016-07-05)

- Initial release
