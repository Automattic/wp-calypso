export interface NumberFormatParams {
	/**
	 * Number to format.
	 */
	number: number | bigint;
	/**
	 * Browser-safe locale string that works with Intl.NumberFormat e.g. 'en-US' (not 'en_US').
	 */
	browserSafeLocale: string;
	/**
	 * Number of decimal places to use.
	 * This is just convenience over setting `minimumFractionDigits`, `maximumFractionDigits` to the same value.
	 * ( default = 0 )
	 */
	decimals?: number;
	/**
	 * Whether to use latin numbers by default ( default = true ).
	 */
	forceLatin?: boolean;
	/**
	 * `Intl.NumberFormat` options to pass through.
	 * `minimumFractionDigits` & `maximumFractionDigits` will override `decimals` if set.
	 */
	numberFormatOptions?: Intl.NumberFormatOptions;
}

export interface CurrencyOverride {
	symbol?: string;
}

export interface NumberFormatCurrencyParams {
	/**
	 * Number to format.
	 */
	number: number;

	/**
	 * Browser-safe locale string that works with Intl.NumberFormat e.g. 'en-US' (not 'en_US').
	 */
	browserSafeLocale: string;

	/**
	 * Currency code.
	 */
	currency: string;

	/**
	 * Whether to use latin numbers by default ( default = true ).
	 */
	forceLatin?: boolean;

	/**
	 * The user's geo location if available.
	 */
	geoLocation?: string;

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
	 * If the number is greater than 0, setting this to true will include its
	 * sign (eg: `+$35.00`). Has no effect on negative numbers or 0.
	 */
	signForPositive?: boolean;
}

export type NumberFormat = ( params: NumberFormatParams ) => string;
export type NumberFormatCurrency = ( params: NumberFormatCurrencyParams ) => string;
