export interface FormatCurrencyOptions {
	/**
	 * The symbol separating the integer part of a decimal from its fraction.
	 *
	 * Will be set automatically by the currency code.
	 */
	decimal?: string;

	/**
	 * The symbol separating the thousands part of an amount from its hundreds.
	 *
	 * Will be set automatically by the currency code.
	 */
	grouping?: string;

	/**
	 * The symbol separating the thousands part of an amount from its hundreds.
	 *
	 * Will be set automatically by the currency code.
	 */
	precision?: number;

	/**
	 * The currency symbol.
	 *
	 * Will be set automatically by the currency code.
	 */
	symbol?: string;

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
}

export interface CurrencyObject {
	sign: string;
	symbol: string;
	integer: string;
	fraction: string;
}

export interface CurrencyDefinition {
	symbol: string;
	grouping: string;
	decimal: string;
	precision: number;
}

export interface CurrenciesDictionary {
	[ currencyCode: string ]: CurrencyDefinition;
}
