#### v2.0.0 (---)

- Breaking: Required Node version increased to >=0.12.0
- Fix: `npm test` is now run synchronously so it exits with a non-zero code on failure
- Fix: Replace ES2015 variable (`let`) declarations to accommodate older Node versions
- Fix: Remove unintended debugging statement from i18n-no-newlines rule
- Fix: jsx-classname-namespace will now correctly identify index components in Windows environments ([#18](https://github.com/Automattic/eslint-plugin-wpcalypso/pull/18))
- General: Add `files` to `package.json` to omit files relevant only for development
- General: Use shared configuration for linting (yo dawg, i herd you like ESLint rules...) ([#22](https://github.com/Automattic/eslint-plugin-wpcalypso/pull/22))

#### v1.4.1 (August 12, 2016)

- Add: String template support for all rules 

#### v1.4.0 (July 29, 2016)

- Add: i18n-no-newlines: Warn on newlines in translatable text

#### v1.3.3 (June 28, 2016)

- Fix: jsx-classname-namespace: Only consider components in index.js(x) as being eligible for root export
- Fix: jsx-classname-namespace: Ensure child component isn't exactly equal to namespace prefix

#### v1.3.2 (June 23, 2016)

- Fix: jsx-classname-namespace: Skip validation on render call expressions (ReactDOM.render)
- General: Upgrade ESLint (^1.10.3 to ^2.13.1) and babel-eslint (^5.0.0-beta6 to ^6.1.0)
- General: Add `npm run lint` npm script, included in `npm test`

#### v1.3.1 (June 17, 2016)

- Fix: jsx-classname-namespace: JSX child expressions should not be considered root elements

#### v1.3.0 (June 16, 2016)

- New rule: [`jsx-classname-namespace`](docs/rules/jsx-classname-namespace.md)

#### v1.2.0 (June 9, 2016)

- New rule: [`jsx-gridicon-size`](docs/rules/jsx-gridicon-size.md)

#### v1.1.4 (June 9, 2016)

- Fix: i18n-no-variables should allow ES2015 template literal strings as long as there are no interpolated variables

#### v1.1.3 (March 8, 2016)

- Fix: i18n-named-placeholders: Account for escaped percentage
- Fix: Extract callee from MemberExpression (e.g. `this.translate`, `i18n.translate`)

#### v1.1.2 (March 8, 2016)

- Fix: i18n-no-variables: Account for options passed as first argument

#### v1.1.1 (March 8, 2016)

- Fix: Include missing credits for regular expression adaptation

#### v1.1.0 (March 8, 2016)

- New rule: [`i18n-ellipsis`](docs/rules/i18n-ellipsis.md)
- New rule: [`i18n-no-variables`](docs/rules/i18n-no-variables.md)
- New rule: [`i18n-no-placeholders-only`](docs/rules/i18n-no-placeholders-only.md)
- New rule: [`i18n-mismatched-placeholders`](docs/rules/i18n-mismatched-placeholders.md)
- New rule: [`i18n-named-placeholders`](docs/rules/i18n-named-placeholders.md)
