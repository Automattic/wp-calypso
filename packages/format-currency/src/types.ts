export interface CurrencyFormatter {
	geolocateCurrencySymbol: () => Promise< void >;

	/**
	 * Set a default locale for use by `formatCurrency` and `getCurrencyObject`.
	 *
	 * Note that this is global and will override any browser locale that is set!
	 * Use it with care.
	 */
	setDefaultLocale: ( locale: string | undefined ) => void;

	/**
	 * Formats money with a given currency code.
	 *
	 * The currency will define the properties to use for this formatting, but
	 * those properties can be overridden using the options. Be careful when doing
	 * this.
	 *
	 * For currencies that include decimals, this will always return the amount
	 * with decimals included, even if those decimals are zeros. To exclude the
	 * zeros, use the `stripZeros` option. For example, the function will normally
	 * format `10.00` in `USD` as `$10.00` but when this option is true, it will
	 * return `$10` instead.
	 *
	 * Since rounding errors are common in floating point math, sometimes a price
	 * is provided as an integer in the smallest unit of a currency (eg: cents in
	 * USD or yen in JPY). Set the `isSmallestUnit` to change the function to
	 * operate on integer numbers instead. If this option is not set or false, the
	 * function will format the amount `1025` in `USD` as `$1,025.00`, but when the
	 * option is true, it will return `$10.25` instead.
	 *
	 * If the number is NaN, it will be treated as 0.
	 *
	 * If the currency code is not known, this will assume a default currency
	 * similar to USD.
	 *
	 * If `isSmallestUnit` is set and the number is not an integer, it will be
	 * rounded to an integer.
	 * @param      {number}                   number     number to format; assumed to be a float unless isSmallestUnit is set.
	 * @param      {string}                   code       currency code e.g. 'USD'
	 * @param      {CurrencyObjectOptions}    options    options object
	 * @returns    {string}                  A formatted string.
	 */
	formatCurrency: (
		amount: number,
		currencyCode: string,
		options?: CurrencyObjectOptions
	) => string;

	/**
	 * Returns a formatted price object which can be used to manually render a
	 * formatted currency (eg: if you wanted to render the currency symbol in a
	 * different font size).
	 *
	 * The currency will define the properties to use for this formatting, but
	 * those properties can be overridden using the options. Be careful when doing
	 * this.
	 *
	 * For currencies that include decimals, this will always return the amount
	 * with decimals included, even if those decimals are zeros. To exclude the
	 * zeros, use the `stripZeros` option. For example, the function will normally
	 * format `10.00` in `USD` as `$10.00` but when this option is true, it will
	 * return `$10` instead.
	 *
	 * Since rounding errors are common in floating point math, sometimes a price
	 * is provided as an integer in the smallest unit of a currency (eg: cents in
	 * USD or yen in JPY). Set the `isSmallestUnit` to change the function to
	 * operate on integer numbers instead. If this option is not set or false, the
	 * function will format the amount `1025` in `USD` as `$1,025.00`, but when the
	 * option is true, it will return `$10.25` instead.
	 *
	 * Note that the `integer` return value of this function is not a number, but a
	 * locale-formatted string which may include symbols like spaces, commas, or
	 * periods as group separators. Similarly, the `fraction` property is a string
	 * that contains the decimal separator.
	 *
	 * If the number is NaN, it will be treated as 0.
	 *
	 * If the currency code is not known, this will assume a default currency
	 * similar to USD.
	 *
	 * If `isSmallestUnit` is set and the number is not an integer, it will be
	 * rounded to an integer.
	 * @param      {number}                   number     number to format; assumed to be a float unless isSmallestUnit is set.
	 * @param      {string}                   code       currency code e.g. 'USD'
	 * @param      {CurrencyObjectOptions}    options    options object
	 * @returns    {CurrencyObject}          A formatted string e.g. { symbol:'$', integer: '$99', fraction: '.99', sign: '-' }
	 */
	getCurrencyObject: (
		amount: number,
		currencyCode: string,
		options?: CurrencyObjectOptions
	) => CurrencyObject;
}

export interface CurrencyOverride {
	symbol?: string;
}

export interface CurrencyObjectOptions {
	/**
	 * The symbol separating the thousands part of an amount from its hundreds.
	 *
	 * Will be set automatically by the currency code.
	 */
	precision?: number;

	/**
	 * Forces any decimal zeros to be hidden if set.
	 *
	 * For example, the function will normally format `10.00` in `USD` as
	 * `$10.00` but when this option is true, it will return `$10` instead.
	 *
	 * For currencies without decimals (eg: JPY), this has no effect.
	 */
	stripZeros?: boolean;

	/**
	 * Changes function to treat number as an integer in the currency's smallest unit.
	 *
	 * Since rounding errors are common in floating point math, sometimes a price
	 * is provided as an integer in the smallest unit of a currency (eg: cents in
	 * USD or yen in JPY). If this option is false, the function will format the
	 * amount `1025` in `USD` as `$1,025.00`, but when the option is true, it
	 * will return `$10.25` instead.
	 */
	isSmallestUnit?: boolean;

	/**
	 * The locale for the formatting.
	 *
	 * Some currencies are formatted differently depending on the locale. If not
	 * set, this will be retrieved from the user's browser.
	 */
	locale?: string;

	/**
	 * If the number is greater than 0, setting this to true will include its
	 * sign (eg: `+$35.00`). Has no effect on negative numbers or 0.
	 */
	signForPositive?: boolean;
}

export interface CurrencyObject {
	/**
	 * The negative sign for the price, if it is negative, or the positive sign
	 * if `signForPositive` is set.
	 */
	sign: '-' | '+' | '';

	/**
	 * The currency symbol for the formatted price.
	 *
	 * Note that the symbol's position depends on the `symbolPosition` property,
	 * and keep RTL locales in mind.
	 */
	symbol: string;

	/**
	 * The position of the currency symbol relative to the formatted price.
	 */
	symbolPosition: 'before' | 'after';

	/**
	 * The section of the formatted price before the decimal.
	 *
	 * Note that this is not a number, but a locale-formatted string which may
	 * include symbols like spaces, commas, or periods as group separators.
	 */
	integer: string;

	/**
	 * The section of the formatted price after and including the decimal.
	 *
	 * Note that this is not a number, but a locale-formatted string which may
	 * include symbols like spaces, commas, or periods as the decimal separator.
	 */
	fraction: string;

	/**
	 * True if the formatted number has a non-0 decimal part.
	 */
	hasNonZeroFraction: boolean;
}
