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

## Why does this package exist?

Formatting currency amounts can be surprisingly complex. Most people assume that the currency itself is the main thing that defines how to write an amount of money but it is actually more affected by locale and a number of options.

Technically this package just provides a wrapper for `Intl.NumberFormat`, but it handles a lot of things automatically to make things simple and provide consistency. Here's what the functions of this package provide:

- A cached number formatter for performance, keyed by currency and locale as well as any other options which must be passed to the `Intl` formatter (whether to show non-zero decimals, and whether to display a `+` sign for positive amounts).
- The locale is set from WordPress, if available, but also falls back to the browser’s locale, and can be set explicitly if WordPress is not available (eg: for a logged-out pricing page).
- This uses a forced latin character set to make sure we always display latin numbers for consistency.
- We override currency codes with a hard-coded list. This is for consistency and so that some currencies seem less confusing when viewed in EN locales, since those are the default locales for many users (eg: always use `C$` for CAD instead of `CA$` or just `$` which are the CLDR standard depending on locale since `$` might imply CAD and it might imply USD).
- We always show `US$` for USD when the user’s geolocation is not inside the US. This is important because other currencies use `$` for their currency and are surprised sometimes if they are actually charged in USD (which is the default for many users). We can’t safely display `US$` for everyone because we've found that US users are confused by that style and it decreases confidence in the product.
- An option to format currency from the currency’s smallest unit (eg: cents in USD, yen in JPY). This is important because doing price math with floating point numbers in code produces unexpected rounding errors, so most currency amounts should be provided and manipulated as integers.
- An optional API to return the formatted pieces of a price separately, so the consumer can decide how best to render them (eg: this is used to wrap different HTML tags around prices and currency symbols). JS already includes this feature as `Intl.NumberFormat.formatToParts()` but our API must also include the other features listed here and extra information like the position of the currency symbol (before or after the number).

## createFormatter()

`createFormatter(): CurrencyFormatter`

Returns a formatter object that exposes the following methods:

- `formatCurrency` (see below)
- `getCurrencyObject` (see below)
- `setDefaultLocale` (see below)
- `geolocateCurrencySymbol` (see below)

## geolocateCurrencySymbol()

`geolocateCurrencySymbol(): Promise<void>`

This will attempt to make an unauthenticated network request to `https://public-api.wordpress.com/geo/`. This is to determine the country code to provide better USD formatting. By default, the currency symbol for USD will be based on the locale (unlike other currency codes which use a hard-coded list of overrides); for `en-US`/`en` it will be `$` and for all other locales it will be `US$`. However, if the geolocation determines that the country is not inside the US, the USD symbol will be `US$` regardless of locale. This is to prevent confusion for users in non-US countries using an English locale.

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

### `signForPositive?: boolean`

If the number is greater than 0, setting this to true will include its sign (eg: `+$35.00`). Has no effect on negative numbers or 0.

## CurrencyObject

An object with the following properties:

### `sign: '-' | '+' | ''`

The negative sign for the price, if it is negative, or the positive sign if `signForPositive` is set.

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
