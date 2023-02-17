# Disallow declaring variables with unexpected identifier names referring to translation functions.

When declaring a variable that points to a translate function reference from `i18n-calypso` or `@wordpress/react-i18n` (`@wordpress/i18n`), the identifier name of the variable should match the original name of the translation function, i.e. `translate` for `i18n-calypso`, or `__, _n, _nx, _x` for `@wordpress/react-i18n`.

This rule is required as the string extraction tools are based on static code analysis and would only detect the strings from function calls with the specified identifiers.

## Rule Details

The following patterns are considered warnings:

```js
const __ = useTranslate();
const t = useTranslate();
```

```js
const { __: translate } = useI18n();
const { _nx: _n } = useTranslate();
```

The following patterns are not warnings:

```js
const translate = useTranslate();
```

```js
const { __ } = useI18n();
const { _n } = useI18n();
const { _nx } = useI18n();
const { _x } = useI18n();
const { __, _n, _nx, _x } = useI18n();
```
