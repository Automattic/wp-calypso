## Trunk

- Breaking: Emitter object replaced with subscriber
  - Before: `i18n.on( 'change', callback ); i18n.off( 'change', callback );`
  - After: `const unsubscribe = i18n.subscribe( callback ); unsubscribe();`

## 7.5.0

- Add `translationOptions` to fixMe so it can work on translations with context.

## 7.4.0

- Add type for `fixMe` method

## 7.3.0

- `formatCurrency` and `getCurrencyObject` methods added. Migrated from `format-currency` package
- `geolocateCurrencySymbol` method and `geoLocation` state variable added. Migrated from `format-currency` package
- updated `getCachedFormatter` in `number-formatters` to account for fallback
- removed `lodash` dependency as not used anywhere

## 7.2.2

- TS configuration & jest depdencies

## 7.2.1

- `compact` option for `numberFormat`

## 7.2.0

- Replace `number_format` with `Intl.NumberFormat`
- Add and export `getBrowserSafeLocal` method

## 7.1.0

- Add new `fixMe` method for conditionally loading a copy given a respective translation exists

## 7.0.0

- Update React peer dependency to v18.
- Improve TypeScript type definitions.
- Update dependency `@wordpress/compose` to `^6.25.0`.
- Update dependency `use-subscription` to `1.6.0`.

## 6.0.1

- Fix an issue in the published build of i18n-calypso which prevented it from installing correctly.

## 6.0.0

- Update React peer dependency to v17.
- Declare TranslateResult as ReactNode, add textOnly overload (#58938)
- Make i18n.translate return ReactChild (#59095)
- Update most dependencies.

## 5.1.0 (next)

- Add `i18n.getLocaleVariant()` method to get a nonstandard locale variant slug.
- Bump `interpolate-components` (renamed to `@automattic/interpolate-components`) to 1.1.2 (for React 17 compat).
- Add support for passing an `I18N` object in React context

## 5.0.0

- Dependencies: Move `react` to `peerDependencies`. `i18n-calypso` no longer depends on `react` directly and consumers should install the dependency.
- Breaking change: drop support for moment both in `i18n.moment` and `i18n.localize`. It's no longer desirable for moment to be a mandatory dependency of i18n-calypso.
- Update debug to v4
- Switch from Jed to Tannin, for smaller size as well as runtime speedups

## 4.1.0

- Add `i18n.isRtl()` method to determine current locale's text direction and the `useRtl` and `withRtl` React wrappers

## 4.0.0

- Move i18n-calypso into Calypso repository.
- Refactor i18n-calypso to Calypso standards.
- Add TypeScript type definitions to package.
- Add support for extracting strings from TypeScript.
- Update dependency `lodash` to `^4.17.11`
- Update `xgettext-js` to `^3.0.0`
- Moved the CLI tool to separate package `i18n-calypso-cli`

## 3.0.0

- Update Jed dependency to v1.1.1. This is a breaking change, since as of Jed v1.1, the format of Jed translation files has changed. Refer to <https://github.com/messageformat/Jed/pull/33> for details.

## 2.0.2

- The localize HoC will now pass down the current locale slug as a `locale` prop to the wrapped component [#77](https://github.com/Automattic/i18n-calypso/pull/77).
- Open up the range on the moment-timezone dependency to allow clients to use any moment-timezone from the 0.5 range. [#78](https://github.com/Automattic/i18n-calypso/pull/78)

## 2.0.1

- Update parseOptions passed to xgettext to include more modern features <https://github.com/Automattic/i18n-calypso/pull/68>
- Switch to hash.js from sha1 for hashing to cut size <https://github.com/Automattic/i18n-calypso/pull/67>
- Remove async dependency, as it was unused <https://github.com/Automattic/i18n-calypso/pull/66>

  2.0.0

---

- Update xgettext-js [#55](https://github.com/Automattic/i18n-calypso/pull/55).
- Update to circlci v2 configuration [#57](https://github.com/Automattic/i18n-calypso/pull/57).
- Update npm audit vulnerabilities [#56](https://github.com/Automattic/i18n-calypso/pull/56).
- Drop obsolete react-test-env dependency [#58](https://github.com/Automattic/i18n-calypso/pull/58).
- Remove the `this.translate()` mixin, see [#59](https://github.com/Automattic/i18n-calypso/pull/59).
- Fix circular reference when calling JSON.stringify with the Community Translator enabled in Calypso [#54](https://github.com/Automattic/i18n-calypso/pull/54).
- Update CI image to node:10 and use `npm cit`, see [#63](https://github.com/Automattic/i18n-calypso/pull/63).

## 1.9.1

Fix a reference to an undefined value.

## 1.9.0

Add support for [key hashing](https://github.com/Automattic/i18n-calypso/#key-hashing) and add a method [`hasTranslation()`](https://github.com/Automattic/i18n-calypso/#hastranslation-method).

## 1.8.5

Allow newer versions of xgettext-js [#46](https://github.com/Automattic/i18n-calypso/pull/46).

## 1.8.4

Bump `interpolate-components` to 1.1.1 (for React 16 compat).

## 1.8.3

Change localize hoc's es6 class --> [create-react-class](https://www.npmjs.com/package/create-react-class) so that the code is still technically es5 and will not need a build step.

## 1.8.2

Change localize hoc's React.createClass --> es6 classes for React 16 compat.

## 1.8.1

Fix a control sequence escaping error in POT files, see [#41](https://github.com/Automattic/i18n-calypso/pull/41).

## 1.8.0

Merge locale data with existing one when we're not switching locale, see [#40](https://github.com/Automattic/i18n-calypso/pull/40).

## 1.7.4

Handle options with new plural syntax, see [#37](https://github.com/Automattic/i18n-calypso/pull/37).

## 1.7.3

Improve input file pattern support, see [#25](https://github.com/Automattic/i18n-calypso/pull/25).

## 1.7.2

Update `moment-timezone` to version `0.5.11`.

## 1.7.1

- Allow exposed composed component, see [#25](https://github.com/Automattic/i18n-calypso/pull/25).
- Change Localize HOC display name to be consistent with react-redux, see [#29](https://github.com/Automattic/i18n-calypso/pull/29).

## 1.7.0

Replace LRU cache implementation, see [#18](https://github.com/Automattic/i18n-calypso/pull/18).

## 1.6.3

Add support for glob in inputFiles, see [#16](https://github.com/Automattic/i18n-calypso/pull/16).

## 1.6.1 + 1.6.2

Fix invalid POT output when strings contained a line break, see [#14](https://github.com/Automattic/i18n-calypso/pull/14).

## 1.6.0

- Add method to add/overwrite translations, see [#10](https://github.com/Automattic/i18n-calypso/pull/10).
- Add ability to parse Calypso source by switching to xgettext-js 1.0.0 and enabling the necessary plugins, see [#13](https://github.com/Automattic/i18n-calypso/pull/13).

## 1.5.0

- POT: enable output of string locations, see [#12](https://github.com/Automattic/i18n-calypso/pull/12).
