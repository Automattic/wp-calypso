import { FALLBACK_CURRENCY } from '../constants';
import { getCachedFormatter } from '../get-cached-formatter';
import { defaultCurrencyOverrides } from './currencies';
import type { CurrencyOverride, NumberFormatCurrency, NumberFormatCurrencyParams } from '../types';

/**
 * Retrieves the currency override for a given currency.
 * If the currency is USD and the user is not in the US, it will return `US$`.
 */
function getCurrencyOverride(
	currency: string,
	geoLocation?: string
): CurrencyOverride | undefined {
	if ( currency === 'USD' && geoLocation && geoLocation !== '' && geoLocation !== 'US' ) {
		return { symbol: 'US$' };
	}
	return defaultCurrencyOverrides[ currency ];
}

/**
 * Returns a valid currency code based on a shortlist of currency codes.
 * Only currencies from the shortlist are allowed. Everything else will fall back to `FALLBACK_CURRENCY`.
 */
function getValidCurrency( currency: string, geoLocation?: string ): string {
	if ( ! getCurrencyOverride( currency, geoLocation ) ) {
		// eslint-disable-next-line no-console
		console.warn(
			`getValidCurrency was called with a non-existent currency "${ currency }"; falling back to ${ FALLBACK_CURRENCY }`
		);
		return FALLBACK_CURRENCY;
	}
	return currency;
}

function getCurrencyFormatter( {
	number,
	currency,
	browserSafeLocale,
	forceLatin = true,
	stripZeros,
	signForPositive,
}: NumberFormatCurrencyParams ): Intl.NumberFormat {
	/**
	 * `numberingSystem` is an option to `Intl.NumberFormat` and is available
	 * in all major browsers according to
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
	 * but is not part of the TypeScript types in `es2020`:
	 *
	 * https://github.com/microsoft/TypeScript/blob/cfd472f7aa5a2010a3115263bf457b30c5b489f3/src/lib/es2020.intl.d.ts#L272
	 *
	 * However, it is part of the TypeScript types in `es5`:
	 *
	 * https://github.com/microsoft/TypeScript/blob/cfd472f7aa5a2010a3115263bf457b30c5b489f3/src/lib/es5.d.ts#L4310
	 *
	 * Apparently calypso uses `es2020` so we cannot use that option here right
	 * now. Instead, we will use the unicode extension to the locale, documented
	 * here:
	 *
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/numberingSystem#adding_a_numbering_system_via_the_locale_string
	 */
	const locale = `${ browserSafeLocale }${ forceLatin ? '-u-nu-latn' : '' }`;
	const numberFormatOptions: Intl.NumberFormatOptions = {
		style: 'currency',
		currency,
		...( stripZeros &&
			Number.isInteger( number ) && {
				/**
				 * There's an option called `trailingZeroDisplay` but it does not yet work
				 * in FF so we have to strip zeros manually.
				 */
				maximumFractionDigits: 0,
				minimumFractionDigits: 0,
			} ),
		...( signForPositive && { signDisplay: 'exceptZero' } ),
	};
	return getCachedFormatter( {
		locale,
		options: numberFormatOptions,
	} );
}

function getPrecisionForLocaleAndCurrency(
	browserSafeLocale: string,
	currency: string,
	forceLatin?: boolean
): number | undefined {
	const formatter = getCurrencyFormatter( { number: 0, currency, browserSafeLocale, forceLatin } );
	/**
	 * For regular numbers, the default is 3 if neither `minimumFractionDigits` or `maximumFractionDigits` are set,
	 * otherwise the greatest betweem `minimumFractionDigits` and 3.
	 *
	 * For currencies, the default is dependent on the currency.
	 *
	 * This may also result in undefined, for several reasons:
	 * see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#significantdigitsfractiondigits_default_values
	 */
	return formatter.resolvedOptions().maximumFractionDigits;
}

/**
 * Scales a number to a specified precision and rounds it to that precision.
 * It ensures that all currency values are consistently rounded to the desired precision,
 * avoiding issues with floating-point arithmetic.
 */
function scaleNumberForPrecision( number: number, currencyPrecision: number ): number {
	const scale = Math.pow( 10, currencyPrecision );
	return Math.round( number * scale ) / scale;
}

function prepareNumberForFormatting(
	number: number,
	// currencyPrecision here must be the precision of the currency, regardless
	// of what precision is requested for display!
	currencyPrecision: number,
	isSmallestUnit?: boolean
): number {
	if ( isNaN( number ) ) {
		// eslint-disable-next-line no-console
		console.warn( 'formatCurrency was called with NaN' );
		return 0;
	}

	if ( isSmallestUnit ) {
		if ( ! Number.isInteger( number ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				'formatCurrency was called with isSmallestUnit and a float which will be rounded',
				number
			);
		}
		const smallestUnitDivisor = 10 ** currencyPrecision;
		return scaleNumberForPrecision( Math.round( number ) / smallestUnitDivisor, currencyPrecision );
	}

	return scaleNumberForPrecision( number, currencyPrecision );
}

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
 * @returns    {string}                  A formatted string.
 */
const numberFormatCurrency: NumberFormatCurrency = ( {
	number,
	browserSafeLocale,
	currency,
	stripZeros,
	isSmallestUnit,
	signForPositive,
	geoLocation,
	forceLatin,
} ) => {
	const validCurrency = getValidCurrency( currency, geoLocation );
	const currencyOverride = getCurrencyOverride( validCurrency, geoLocation );
	const currencyPrecision = getPrecisionForLocaleAndCurrency(
		browserSafeLocale,
		validCurrency,
		forceLatin
	);

	if ( isSmallestUnit && typeof currencyPrecision === 'undefined' ) {
		throw new Error(
			`Could not determine currency precision for ${ validCurrency } in ${ browserSafeLocale }`
		);
	}

	const numberAsFloat = prepareNumberForFormatting(
		number,
		currencyPrecision ?? 0,
		isSmallestUnit
	);
	const formatter = getCurrencyFormatter( {
		number: numberAsFloat,
		currency: validCurrency,
		browserSafeLocale,
		forceLatin,
		stripZeros,
		signForPositive,
	} );
	const parts = formatter.formatToParts( numberAsFloat );

	return parts.reduce( ( formatted, part ) => {
		switch ( part.type ) {
			case 'currency':
				if ( currencyOverride?.symbol ) {
					return formatted + currencyOverride.symbol;
				}
				return formatted + part.value;
			default:
				return formatted + part.value;
		}
	}, '' );
};

export { numberFormatCurrency as __DO_NOT_IMPORT__numberFormatCurrency };
