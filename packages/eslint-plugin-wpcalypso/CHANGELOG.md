#### Unreleased
- Breaking: Removed rule [`import-no-redux-combine-reducers`](docs/rules/import-no-redux-combine-reducers.md)
- Enhancement: `jsx-classname-namespace` understands Storybook `index.stories.js` files and treats them as root files

#### v4.1.0 (2019-05-07)

- Enhancement: `jsx-classname-namespace` doesn't limit classnames without suffix to root elements
- Enhancement: `jsx-classname-namespace` accepts both file and directory name when validating class name
- Enhancement: `i18n-ellipsis` rule updated to catch usage in @wordpress/i18n functions

#### v4.0.2 (2018-08-10)

- General: Updated Mocha from 3.0.2 to 5.2.x
- General: Refreshed package-lock.json

#### v4.0.1 (2017-10-13)

- Fix: i18n-ellipsis: Running the fixer for this rule no longer incorrectly removes quotes

#### v4.0.0 (2017-09-07)

- Breaking: Upgraded ESLint from 3.x to 4.x. [See v4.0.0 Migration Guide](https://eslint.org/docs/user-guide/migrating-to-4.0.0)

#### v3.4.1 (2017-08-03)

- Fix: i18n-named-placeholders: Resolve error thrown if `translate` has no arguments

#### v3.4.0 (2017-05-26)

- New Rule: [`redux-no-bound-selectors`](docs/rules/redux-no-bound-selectors.md)

#### v3.3.0 (2017-05-25)

- New Rule: [`import-no-redux-combine-reducers`](docs/rules/import-no-redux-combine-reducers.md)

#### v3.2.0 (2017-04-11)

- Updated: jsx-classname-namespace: New "rootFiles" option to specify files in which components are to be considered as root (defaults to "index.js", "index.jsx") ([#34](https://github.com/Automattic/eslint-plugin-wpcalypso/pull/34), thanks @bperson)
- Updated: jsx-classname-namespace: Improved error messaging for root components in non-root files

#### v3.1.1 (2017-04-08)

- Fix: added a documentation link to the `i18n-no-this-translate` error message

#### v3.1.0 (2017-01-26)

- New rule: [`post-message-no-wildcard-targets`](docs/rules/post-message-no-wildcard-targets.md)

#### v3.0.2 (2016-10-24)

- Fix: `import-docblock` less strict with matched docblocks (case insensitive, trailing spaces)

#### v3.0.1 (2016-10-21)

- Fix: Resolve issue where `i18n-no-collapsible-whitespace` may result in an error when text cannot be determined

#### v3.0.0 (2016-10-21)

- Breaking: Removed `no-lodash-import` rule in favor of using [`babel-plugin-lodash`](https://github.com/lodash/babel-plugin-lodash) to transform root Lodash imports
- Breaking: Removed `i18n-no-newlines` rule in favor of using `i18n-no-collapsible-whitespace`, which warns for a superset of whitespace issues
- New rule: [`import-docblock`](docs/rules/import-docblock.md)
- New rule: [`i18n-no-this-translate`](docs/rules/i18n-no-this-translate.md)
- Fix: `jsx-classname-namespace` will not allow underscores except as separator after namespace

#### v2.0.0 (2016-08-24)

- Breaking: Required Node version increased from >=0.10.x to >=4.x ([see ESLint 3.0.0 migration guide](http://eslint.org/docs/user-guide/migrating-to-3.0.0))
- Fix: `jsx-classname-namespace` can accurately validate elements assigned to variables within render ([#21](https://github.com/Automattic/eslint-plugin-wpcalypso/pull/21))
- Fix: `yarn test` is now run synchronously so it exits with a non-zero code on failure
- Fix: Replace ES2015 variable (`let`) declarations to accommodate older Node versions
- Fix: Remove unintended debugging statement from i18n-no-newlines rule
- Fix: jsx-classname-namespace will now correctly identify index components in Windows environments ([#18](https://github.com/Automattic/eslint-plugin-wpcalypso/pull/18))
- General: Add `files` to `package.json` to omit files relevant only for development
- General: Use shared configuration for linting (yo dawg, i herd you like ESLint rules...) ([#22](https://github.com/Automattic/eslint-plugin-wpcalypso/pull/22))
- General: Updated ESLint from 2.x to 3.x

#### v1.4.1 (2016-08-12)

- Add: String template support for all rules

#### v1.4.0 (2016-07-29)

- Add: i18n-no-newlines: Warn on newlines in translatable text

#### v1.3.3 (2016-06-28)

- Fix: jsx-classname-namespace: Only consider components in index.js(x) as being eligible for root export
- Fix: jsx-classname-namespace: Ensure child component isn't exactly equal to namespace prefix

#### v1.3.2 (2016-06-23)

- Fix: jsx-classname-namespace: Skip validation on render call expressions (ReactDOM.render)
- General: Upgrade ESLint (^1.10.3 to ^2.13.1) and babel-eslint (^5.0.0-beta6 to ^6.1.0)
- General: Add `yarn run lint` npm script, included in `yarn test`

#### v1.3.1 (2016-06-17)

- Fix: jsx-classname-namespace: JSX child expressions should not be considered root elements

#### v1.3.0 (2016-06-16)

- New rule: [`jsx-classname-namespace`](docs/rules/jsx-classname-namespace.md)

#### v1.2.0 (2016-06-09)

- New rule: [`jsx-gridicon-size`](docs/rules/jsx-gridicon-size.md)

#### v1.1.4 (2016-06-09)

- Fix: i18n-no-variables should allow ES2015 template literal strings as long as there are no interpolated variables

#### v1.1.3 (2016-03-08)

- Fix: i18n-named-placeholders: Account for escaped percentage
- Fix: Extract callee from MemberExpression (e.g. `this.translate`, `i18n.translate`)

#### v1.1.2 (2016-03-08)

- Fix: i18n-no-variables: Account for options passed as first argument

#### v1.1.1 (2016-03-08)

- Fix: Include missing credits for regular expression adaptation

#### v1.1.0 (2016-03-08)

- New rule: [`i18n-ellipsis`](docs/rules/i18n-ellipsis.md)
- New rule: [`i18n-no-variables`](docs/rules/i18n-no-variables.md)
- New rule: [`i18n-no-placeholders-only`](docs/rules/i18n-no-placeholders-only.md)
- New rule: [`i18n-mismatched-placeholders`](docs/rules/i18n-mismatched-placeholders.md)
- New rule: [`i18n-named-placeholders`](docs/rules/i18n-named-placeholders.md)
