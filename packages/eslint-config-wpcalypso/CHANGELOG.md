### v4.0.1 (2018-09-13)
- Allow usage of eslint v5 (159e240)

### v4.0.0 (2018-05-15)
- Add ignoreRestSiblings flag to the no-unused-vars rule (94f3de2)

### v3.0.0 (2018-04-25)
- Breaking: removed the react/jsx-no-bind rule. We now allow bound functions by default.
- Updated to react/jsx-tag-spacing from react/jsx-space-before-closing, which was deprecated
- now allow spaces in async arrow functions

#### v2.0.0 (2018-01-24)

- Breaking: Removed the `react-a11y` ruleset. Consumers can use upstream's `plugin:jsx-a11y/recommended` ruleset instead.

#### v1.2.0 (2017-11-03)

- Added: [`no-duplicate-imports`](https://eslint.org/docs/rules/no-duplicate-imports) as error

#### v1.1.1 (2017-10-30)

- Allow for eslint 3.x as a peer dependency instead of only 4.x

#### v1.1.0 (2017-10-03)

- Removed: `quote-props` will no longer flag keyword properties as error ([reference](https://eslint.org/docs/rules/quote-props#keywords))

#### v1.0.0 (2017-09-07)

- Breaking: Upgraded ESLint peer dependency from 3.x to 4.x. [See v4.0.0 Migration Guide](https://eslint.org/docs/user-guide/migrating-to-4.0.0)
- Added: [`comma-dangle`](https://eslint.org/docs/rules/comma-dangle) as error, `"always-multiline"`

#### v0.9.0 (2017-06-14)

- Added: [`wpcalypso/redux-no-bound-selectors`](https://github.com/Automattic/eslint-plugin-wpcalypso/blob/master/docs/rules/redux-no-bound-selectors.md) as error
- Added: [`react/no-string-refs`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-string-refs.md) as error

#### v0.8.0 (2017-05-18)

- Added: [`react/no-deprecated`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-deprecated.md) as error

#### v0.7.1 (2017-03-20)

- Changed: [`eslint-plugin-jsx-a11y`](https://github.com/evcohen/eslint-plugin-jsx-a11y) rules are now errors

#### v0.7.0 (2017-03-20)

- Added: [`eslint-plugin-jsx-a11y`](https://github.com/evcohen/eslint-plugin-jsx-a11y) rules to check for common accessibility issues, as warnings

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
