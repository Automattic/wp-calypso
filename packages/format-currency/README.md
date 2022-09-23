# Format currency

A library for formatting currency.

Exports two functions, `formatCurrency` and `getCurrencyObject`.

`formatCurrency` is also the default export so either of these imports will work:

```
import { formatCurrency } from '@automattic/format-currency';`
import formatCurrency from '@automattic/format-currency';`
```

## formatCurrency()

`formatCurrency( number: number, code: string, options: FormatCurrencyOptions = {} ): string | null`

Formats money with a given currency code.

The currency will define the properties to use for this formatting, but those properties can be overridden using the options. Be careful when doing this.

For currencies that include decimals, this will always return the amount with decimals included, even if those decimals are zeros. To exclude the zeros, use the `stripZeros` option. For example, the function will normally format `10.00` in `USD` as `$10.00` but when this option is true, it will return `$10` instead.

Since rounding errors are common in floating point math, sometimes a price is provided as an integer in the smallest unit of a currency (eg: cents in USD or yen in JPY). Set the `isSmallestUnit` to change the function to operate on integer numbers instead. If this option is not set or false, the function will format the amount `1025` in `USD` as `$1,025.00`, but when the option is true, it will return `$10.25` instead.

Will return null if the currency code is unknown or if the number is not a number. Will also return null if `isSmallestUnit` is set and the number is not an integer.

## getCurrencyObject()

`getCurrencyObject( number: number, code: string, options: FormatCurrencyOptions = {} ): CurrencyObject | null`

Returns a formatted price object.

The currency will define the properties to use for this formatting, but those properties can be overridden using the options. Be careful when doing this.

For currencies that include decimals, this will always return the amount with decimals included, even if those decimals are zeros. To exclude the zeros, use the `stripZeros` option. For example, the function will normally format `10.00` in `USD` as `$10.00` but when this option is true, it will return `$10` instead.

Since rounding errors are common in floating point math, sometimes a price is provided as an integer in the smallest unit of a currency (eg: cents in USD or yen in JPY). Set the `isSmallestUnit` to change the function to operate on integer numbers instead. If this option is not set or false, the function will format the amount `1025` in `USD` as `$1,025.00`, but when the option is true, it will return `$10.25` instead.

Will return null if the currency code is unknown or if the number is not a number. Will also return null if `isSmallestUnit` is set and the number is not an integer.

## FormatCurrencyOptions

An object with the following properties:

### `decimal?: string`

The symbol separating the integer part of a decimal from its fraction.

Will be set automatically by the currency code.

### `grouping?: string`

The symbol separating the thousands part of an amount from its hundreds.

Will be set automatically by the currency code.

### `precision?: number`

The symbol separating the thousands part of an amount from its hundreds.

Will be set automatically by the currency code.

### `symbol?: string`

The currency symbol.

Will be set automatically by the currency code.

### `stripZeros?: boolean`

Forces any decimal zeros to be hidden if set.

For example, the function will normally format `10.00` in `USD` as `$10.00` but when this option is true, it will return `$10` instead.

For currencies without decimals (eg: JPY), this has no effect.

### `isSmallestUnit?: boolean`

Changes function to treat number as an integer in the currency's smallest unit.

Since rounding errors are common in floating point math, sometimes a price is provided as an integer in the smallest unit of a currency (eg: cents in USD or yen in JPY). If this option is false, the function will format the amount `1025` in `USD` as `$1,025.00`, but when the option is true, it will return `$10.25` instead.

## CurrencyObject

An object with the following properties:

### `sign: '-'|''`

The symbol to use for negative values.

### `symbol: string`

The currency symbol (eg: `$` for USD).

### `integer: string`

The integer part of a decimal currency.

### `fraction: string`

The decimal part of a decimal currency.

