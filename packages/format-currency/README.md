# Format currency

A library for formatting currency.

The `formatCurrency` function is the main use of this package and is also the default export so any of these imports will work:

```
import { formatCurrency } from '@automattic/format-currency';`
formatCurrency( /* ... */ );

// Or
import formatCurrency from '@automattic/format-currency';`
formatCurrency( /* ... */ );

// Or
import { createFormatter } from '@automattic/format-currency';`
const formatter = createFormatter();
formatter.formatCurrency( /* ... */ );
```

The formatting functions exposed by this package are actually methods on a `CurrencyFormatter` object. A default global formatter is created by the package but you can create your own formatter by using the `createFormatter` function if you want more control.

## createFormatter()

`createFormatter(): CurrencyFormatter`

Returns a formatter object that exposes the following methods:

- `formatCurrency` (see below)
- `getCurrencyObject` (see below)
- `setDefaultLocale` (see below)
- `setCurrencySymbol` (see below)
- `geolocateCurrencySymbol` (see below)

## geolocateCurrencySymbol()

`geolocateCurrencySymbol(): Promise<void>`

This will attempt to make an unauthenticated network request to `https://public-api.wordpress.com/geo/`. This is to determine the country code to provide better USD formatting. By default, the currency symbol for USD will be based on the locale (unlike other currency codes which use a hard-coded list of overrides; see `setCurrencySymbol`); for `en-US`/`en` it will be `$` and for all other locales it will be `US$`. However, if the geolocation determines that the country is not inside the US, the USD symbol will be `US$` regardless of locale. This is to prevent confusion for users in non-US countries using an English locale.

In the US, users will expect to see USD prices rendered with the currency symbol `$`. However, there are many other currencies which use `$` as their currency symbol (eg: `CAD`). This package tries to prevent confusion between these symbols by using an international version of the symbol when the locale does not match the currency. So if your locale is `en-CA`, USD prices will be rendered with the symbol `US$`. 

However, this relies on the user having set their interface language to something other than `en-US`/`en`, and many English-speaking non-US users still have that interface language (eg: there's no English locale available in our settings for Argentinian English so such users would probably still have `en`). As a result, those users will see a price with `$` and could be misled about what currency is being displayed. `geolocateCurrencySymbol()` helps prevent that from happening by showing `US$` for those users.

## formatCurrency()

`formatCurrency( number: number, code: string, options: FormatCurrencyOptions = {} ): string`

Formats money with a given currency code.

The currency will define the properties to use for this formatting, but those properties can be overridden using the options. Be careful when doing this.

For currencies that include decimals, this will always return the amount with decimals included, even if those decimals are zeros. To exclude the zeros, use the `stripZeros` option. For example, the function will normally format `10.00` in `USD` as `$10.00` but when this option is true, it will return `$10` instead.

Since rounding errors are common in floating point math, sometimes a price is provided as an integer in the smallest unit of a currency (eg: cents in USD or yen in JPY). Set the `isSmallestUnit` to change the function to operate on integer numbers instead. If this option is not set or false, the function will format the amount `1025` in `USD` as `$1,025.00`, but when the option is true, it will return `$10.25` instead.

## getCurrencyObject()

`getCurrencyObject( number: number, code: string, options: FormatCurrencyOptions = {} ): CurrencyObject`

Returns a formatted price object. See below for the details of that object's properties.

The currency will define the properties to use for this formatting, but those properties can be overridden using the options. Be careful when doing this.

For currencies that include decimals, this will always return the amount with decimals included, even if those decimals are zeros. To exclude the zeros, use the `stripZeros` option. For example, the function will normally format `10.00` in `USD` as `$10.00` but when this option is true, it will return `$10` instead. Alternatively, you can use the `hasNonZeroFraction` return value to decide if the decimal section should be displayed.

Since rounding errors are common in floating point math, sometimes a price is provided as an integer in the smallest unit of a currency (eg: cents in USD or yen in JPY). Set the `isSmallestUnit` to change the function to operate on integer numbers instead. If this option is not set or false, the function will format the amount `1025` in `USD` as `$1,025.00`, but when the option is true, it will return `$10.25` instead.

## setDefaultLocale()

`setDefaultLocale( locale: string | undefined ): void`

A function that can be used to set a default locale for use by `formatCurrency()` and `getCurrencyObject()`. Note that this is global and will override any browser locale that is set! Use it with care.

## setCurrencySymbol()

`setCurrencySymbol( currencyCode: string, currencySymbol: string | undefined ): void`

Change the currency symbol override used by formatting.

By default, `formatCurrency` and `getCurrencyObject` use a currency symbol from a list of hard-coded overrides in this package keyed by the currency code. For example, `CAD` is always rendered as `C$` even if the locale is `en-CA` which would normally render the symbol `$`.

With this function, you can change the override used by any given currency.

Note that USD is the only currency that does not have a default override so it will use the locale's preference unless the geolocation network call succeeds (see `geolocateCurrencySymbol`).

## FormatCurrencyOptions

An object with the following properties:

### `precision?: number`

The number of decimal places to display.

Will be set automatically by the currency code.

### `locale?: string`

The locale to use for the formatting. Defaults to using the browser's current locale unless `setDefaultLocale()` has been called.

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

The integer part of a decimal currency. Note that this is not a number, but a locale-formatted string that includes any symbols used for separating the thousands groups (eg: commas, periods, or spaces).

### `fraction: string`

The decimal part of a decimal currency. Note that this is not a number, but a locale-formatted string that includes the decimal separator that may be a comma or a period.

### `symbolPosition: 'before' | 'after'`

The position of the currency symbol relative to the numeric price. If this is `'before'`, the symbol should be placed before the price like `US $ 10`; if this is `'after'`, the symbol should be placed after the price like `10 US $`.

### `hasNonZeroFraction: boolean`

True if the price has a decimal part and that decimal's value is greater than zero. This can be useful to mimic the `stripZeros` option behavior (hiding decimal places if the decimal is zero) without having to specify that option.
