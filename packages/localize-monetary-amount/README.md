# localize-monetary-amount

Locale- (language and geo) and currency-aware formatting of exact monetary amounts. Designed for displaying product prices in catalogs, carts, checkout, and receipts.

What this package does:
  * Number and currency localization (separator symbols, grouping conventions)
  * Use fixed point arithmetic internally -- no floats or rounding.
  
What this package doesn't do:
  * Arithmetic on monetary amounts; formatting only
  * Conversion between currencies
  * Localization of digit symbols -- Hindu-Arabic digits only. (Lifting this restriction is in scope, but currently not implemented)
  * Take options. Locale preferences are hardcoded, please submit an issue if a locale looks off.
  * Use any external dependencies

## Example usage

To format a monetary amount you'll need the following:
  * An ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code, separated by a hyphen. Examples: `en`, `en-gb`, `fr-be`. This is typically the format browsers use for the user's locale.
  * An ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
  * An integer number of _minor units_. This is the minimal unit of your currency; e.g. cents for USD, yen for JPY. May be positive or negative.

If the fractional part is zero it is omitted unless the locale prefers otherwise.

```js
import localizeMonetaryAmount from 'localize-monetary-amount';

// Strip zero minor units:
localizeMonetaryAmount( 'en-us', 'USD', 500 ); // '$5'

// Use non-breaking spaces:
localizeMonetaryAmount( 'fr-ca', 'CAD', 500000 ); // '$5\u00A0000\u00A0CAD'
```
