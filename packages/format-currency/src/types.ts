export interface CurrencyFormatter {
	geolocateCurrencySymbol: () => Promise< void >;
	setDefaultLocale: ( locale: string | undefined ) => void;
	setCurrencySymbol: ( currencyCode: string, currencySymbol: string | undefined ) => void;
	formatCurrency: (
		amount: number,
		currencyCode: string,
		options?: CurrencyObjectOptions
	) => string;
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
}

export interface CurrencyObject {
	/**
	 * The negative sign for the price, if it is negative.
	 */
	sign: '-' | '';

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
