# localize-monetary-amount

Locale- (language and geo) and currency-aware formatting of exact monetary amounts.

What this package does:
  * Number localization (separator symbols, grouping conventions)
  * Integer arithmetic with all digits of precision. No floats.
  * Designed for displaying product prices in catalogs, carts, checkout, and receipts.
  * No dependencies
  
What this package doesn't do:
  * Arithmetic on monetary amounts; formatting only
  * Conversion between currencies
  * Localize digit symbols (Hindu-Arabic digits only)
  * Take options. Locale preferences are hardcoded. Please submit an issue if a locale looks off.

## Example usage

You'll need:
  * An ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code, separated by a hyphen. Examples: `en`, `en-gb`, `fr-be`.
  * An ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
  * An integer number of _minor units_. This is the minimal unit of your currency; e.g. cents for USD, yen for JPY. May be positive or negative.

If the fractional part is zero it is omitted unless the locale prefers otherwise.

```js
import localizeMonetaryAmount from 'localize-monetary-amount';

// Strips zero minor units:
localizeMonetaryAmount( 'en-us', 'USD', 500 ); // '$5'

// Uses non-breaking spaces:
localizeMonetaryAmount( 'fr-ca', 'CAD', 500000 ); // '$5\u00A0000\u00A0CAD'
```
