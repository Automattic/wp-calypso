import getFormatter from './get-formatter';

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

export type NumberFormat = ( params: NumberFormatParams ) => string;

/**
 * Formats numbers using locale settings and/or passed options.
 * @returns {string}  Formatted number as string, or original number as string if formatting fails.
 */
const numberFormat: NumberFormat = ( {
	number,
	browserSafeLocale,
	decimals = 0,
	forceLatin = true,
	numberFormatOptions = {},
} ) => {
	const locale = `${ browserSafeLocale }${ forceLatin ? '-u-nu-latn' : '' }`;
	const options = {
		minimumFractionDigits: decimals, // minimumFractionDigits default is 0
		maximumFractionDigits: decimals, // maximumFractionDigits default is the greater between minimumFractionDigits and 3
		...numberFormatOptions,
	};

	try {
		return getFormatter( { locale, options } )?.format( number );
	} catch ( error ) {
		return String( number );
	}
};

/**
 * Convenience method for formatting numbers in a compact notation e.g. 1K, 1M, etc.
 * Basically sets `notation: 'compact'` and `maximumFractionDigits: 1` in the options.
 * Everything is overridable by passing the `numberFormatOptions` option.
 * If you want more digits, pass `maximumFractionDigits: 2`.
 * @returns {string}  Formatted number as string, or original number as string if formatting fails.
 */
const numberFormatCompact: NumberFormat = ( { numberFormatOptions = {}, ...params } ) =>
	numberFormat( {
		...params,
		numberFormatOptions: {
			notation: 'compact',
			maximumFractionDigits: 1,
			...numberFormatOptions,
		},
	} );

export {
	numberFormat as __DO_NOT_IMPORT__numberFormat,
	numberFormatCompact as __DO_NOT_IMPORT__numberFormatCompact,
};
