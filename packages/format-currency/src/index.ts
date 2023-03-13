import { defaultCurrencyOverrides } from './currencies';
import type {
	CurrencyObject,
	CurrencyObjectOptions,
	CurrencyFormatter,
	CurrencyOverride,
} from './types';

export * from './types';

const formatterCache = new Map< string, Intl.NumberFormat >();
const fallbackLocale = 'en';
const fallbackCurrency = 'USD';
const geolocationEndpointUrl = 'https://public-api.wordpress.com/geo/';

export function createFormatter(): CurrencyFormatter {
	const currencyOverrides: Record< string, { symbol?: string | undefined } > = {};
	let defaultLocale: string | undefined = undefined;

	async function setUsdCurrencySymbolBasedOnGeolocation(): Promise< void > {
		const geoData = await globalThis
			.fetch?.( geolocationEndpointUrl )
			.then( ( response ) => response.json() );
		if ( ! isGeolocationResponse( geoData ) ) {
			return;
		}
		if ( ! geoData.country_short ) {
			return;
		}
		if ( geoData.country_short === 'US' ) {
			setCurrencySymbol( 'USD', '$' );
		} else {
			setCurrencySymbol( 'USD', 'US$' );
		}
	}

	function getFormatter(
		number: number,
		code: string,
		options: CurrencyObjectOptions
	): Intl.NumberFormat {
		const locale = options.locale ?? defaultLocale ?? getLocaleFromBrowser();

		return getCachedFormatter( {
			locale,
			currency: code,
			noDecimals: isNoDecimals( number, options ),
		} );
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
	 *
	 * @param      {number}                   number     number to format; assumed to be a float unless isSmallestUnit is set.
	 * @param      {string}                   code       currency code e.g. 'USD'
	 * @param      {CurrencyObjectOptions}    options    options object
	 * @returns    {string}                  A formatted string.
	 */
	function formatCurrency(
		number: number,
		code: string,
		options: CurrencyObjectOptions = {}
	): string {
		const locale = options.locale ?? defaultLocale ?? getLocaleFromBrowser();
		code = getValidCurrency( code );
		const currencyOverride = getCurrencyOverride( code );
		const currencyPrecision = getPrecisionForLocaleAndCurrency( locale, code );

		const numberAsFloat = prepareNumberForFormatting( number, currencyPrecision, options );
		const formatter = getFormatter( numberAsFloat, code, options );
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
	}

	/**
	 * Returns a formatted price object.
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
	 *
	 * @param      {number}                   number     number to format; assumed to be a float unless isSmallestUnit is set.
	 * @param      {string}                   code       currency code e.g. 'USD'
	 * @param      {CurrencyObjectOptions}    options    options object
	 * @returns    {CurrencyObject}          A formatted string e.g. { symbol:'$', integer: '$99', fraction: '.99', sign: '-' }
	 */
	function getCurrencyObject(
		number: number,
		code: string,
		options: CurrencyObjectOptions = {}
	): CurrencyObject {
		const locale = options.locale ?? defaultLocale ?? getLocaleFromBrowser();
		code = getValidCurrency( code );
		const currencyOverride = getCurrencyOverride( code );
		const currencyPrecision = getPrecisionForLocaleAndCurrency( locale, code );

		const numberAsFloat = prepareNumberForFormatting( number, currencyPrecision, options );
		const formatter = getFormatter( numberAsFloat, code, options );
		const parts = formatter.formatToParts( numberAsFloat );

		let sign = '' as CurrencyObject[ 'sign' ];
		let symbol = '$';
		let symbolPosition = 'before' as CurrencyObject[ 'symbolPosition' ];
		let hasAmountBeenSet = false;
		let hasDecimalBeenSet = false;
		let integer = '';
		let fraction = '';

		parts.forEach( ( part ) => {
			switch ( part.type ) {
				case 'currency':
					symbol = currencyOverride?.symbol ?? part.value;
					if ( hasAmountBeenSet ) {
						symbolPosition = 'after';
					}
					return;
				case 'group':
					integer += part.value;
					hasAmountBeenSet = true;
					return;
				case 'decimal':
					fraction += part.value;
					hasAmountBeenSet = true;
					hasDecimalBeenSet = true;
					return;
				case 'integer':
					integer += part.value;
					hasAmountBeenSet = true;
					return;
				case 'fraction':
					fraction += part.value;
					hasAmountBeenSet = true;
					hasDecimalBeenSet = true;
					return;
				case 'minusSign':
					sign = '-' as CurrencyObject[ 'sign' ];
					return;
			}
		} );

		const hasNonZeroFraction = ! Number.isInteger( numberAsFloat ) && hasDecimalBeenSet;

		return {
			sign,
			symbol,
			symbolPosition,
			integer,
			fraction,
			hasNonZeroFraction,
		};
	}

	function getValidCurrency( code: string ): string {
		if ( ! doesCurrencyExist( code ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				`getCurrencyObject was called with a non-existent currency "${ code }"; falling back to ${ fallbackCurrency }`
			);
			return fallbackCurrency;
		}
		return code;
	}

	/**
	 * Change the currency symbol override used by formatting.
	 *
	 * By default, `formatCurrency` and `getCurrencyObject` use a currency symbol
	 * from a list of hard-coded overrides in this package keyed by the currency
	 * code. For example, `CAD` is always rendered as `C$` even if the locale is
	 * `en-CA` which would normally render the symbol `$`.
	 *
	 * With this function, you can change the override used by any given currency.
	 *
	 * Note that this is global and will take effect no matter the locale! Use it
	 * with care.
	 */
	function setCurrencySymbol( currencyCode: string, currencySymbol: string | undefined ): void {
		if ( ! currencyOverrides[ currencyCode ] ) {
			currencyOverrides[ currencyCode ] = {};
		}
		currencyOverrides[ currencyCode ].symbol = currencySymbol;
	}

	function getCurrencyOverride( code: string ): CurrencyOverride | undefined {
		return currencyOverrides[ code ] ?? defaultCurrencyOverrides[ code ];
	}

	function doesCurrencyExist( code: string ): boolean {
		return Boolean( getCurrencyOverride( code ) );
	}

	/**
	 * Set a default locale for use by `formatCurrency` and `getCurrencyObject`.
	 *
	 * Note that this is global and will override any browser locale that is set!
	 * Use it with care.
	 */
	function setDefaultLocale( locale: string | undefined ): void {
		defaultLocale = locale;
	}

	// If the user is inside the US using USD, they should only see `$` and not `US$`.
	async function detectGeolocation() {
		return setUsdCurrencySymbolBasedOnGeolocation();
	}

	return {
		formatCurrency,
		getCurrencyObject,
		setCurrencySymbol,
		setDefaultLocale,
		detectGeolocation,
	};
}

function getLocaleFromBrowser() {
	if ( typeof window === 'undefined' ) {
		return fallbackLocale;
	}
	if ( window.navigator?.languages?.length > 0 ) {
		return window.navigator.languages[ 0 ];
	}
	return window.navigator?.language ?? fallbackLocale;
}

function getFormatterCacheKey( {
	locale,
	currency,
	noDecimals,
}: {
	locale: string;
	currency: string;
	noDecimals: boolean;
} ): string {
	return `currency:${ currency },locale:${ locale },noDecimals:${ noDecimals }`;
}

function isNoDecimals( number: number, options: CurrencyObjectOptions ) {
	if ( options.stripZeros && Number.isInteger( number ) ) {
		return true;
	}
	return false;
}

/**
 * Creating an Intl.NumberFormat is expensive, so this allows caching.
 */
function getCachedFormatter( {
	locale,
	currency,
	noDecimals,
}: {
	locale: string;
	currency: string;
	noDecimals: boolean;
} ): Intl.NumberFormat {
	const cacheKey = getFormatterCacheKey( { locale, currency, noDecimals } );
	if ( formatterCache.has( cacheKey ) ) {
		const formatter = formatterCache.get( cacheKey );
		if ( formatter ) {
			return formatter;
		}
	}

	try {
		const formatter = new Intl.NumberFormat( addNumberingSystemToLocale( locale ), {
			style: 'currency',
			currency,
			// There's an option called `trailingZeroDisplay` but it does not yet work
			// in FF so we have to strip zeros manually.
			...( noDecimals ? { maximumFractionDigits: 0, minimumFractionDigits: 0 } : {} ),
		} );

		formatterCache.set( cacheKey, formatter );

		return formatter;
	} catch ( error ) {
		// If the locale is invalid, creating the NumberFormat will throw.
		// eslint-disable-next-line no-console
		console.warn(
			`formatCurrency was called with a non-existent locale "${ locale }"; falling back to ${ fallbackLocale }`
		);
		return getCachedFormatter( { locale: fallbackLocale, currency, noDecimals } );
	}
}

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
function addNumberingSystemToLocale( locale: string ): string {
	const numberingSystem = 'latn';
	const numberingSystemUnicodeLocaleExtension = `-u-nu-${ numberingSystem }`;
	const localeWithNumberingSystem = `${ locale }${ numberingSystemUnicodeLocaleExtension }`;
	return localeWithNumberingSystem;
}

function getPrecisionForLocaleAndCurrency( locale: string, currency: string ): number {
	const defaultFormatter = getCachedFormatter( {
		locale,
		currency,
		noDecimals: false,
	} );
	return defaultFormatter.resolvedOptions().maximumFractionDigits;
}

function prepareNumberForFormatting(
	number: number,
	// currencyPrecision here must be the precision of the currency, regardless
	// of what precision is requested for display!
	currencyPrecision: number,
	options: CurrencyObjectOptions
): number {
	if ( isNaN( number ) ) {
		// eslint-disable-next-line no-console
		console.warn( 'formatCurrency was called with NaN' );
		number = 0;
	}

	if ( options.isSmallestUnit ) {
		if ( ! Number.isInteger( number ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				'formatCurrency was called with isSmallestUnit and a float which will be rounded',
				number
			);
			number = Math.round( number );
		}
		number = convertPriceForSmallestUnit( number, currencyPrecision );
	}

	const scale = Math.pow( 10, currencyPrecision );
	return Math.round( number * scale ) / scale;
}

function convertPriceForSmallestUnit( price: number, precision: number ): number {
	return price / getSmallestUnitDivisor( precision );
}

function getSmallestUnitDivisor( precision: number ): number {
	return 10 ** precision;
}

interface GeoLocationResponse {
	country_short: string;
}

function isGeolocationResponse( response: unknown ): response is GeoLocationResponse {
	return typeof ( response as GeoLocationResponse )?.country_short === 'string';
}

const defaultFormatter = createFormatter();

export async function detectGeolocation() {
	return defaultFormatter.detectGeolocation();
}

export function formatCurrency( ...args: Parameters< typeof defaultFormatter.formatCurrency > ) {
	return defaultFormatter.formatCurrency( ...args );
}

export function getCurrencyObject(
	...args: Parameters< typeof defaultFormatter.getCurrencyObject >
) {
	return defaultFormatter.getCurrencyObject( ...args );
}

export function setDefaultLocale(
	...args: Parameters< typeof defaultFormatter.setDefaultLocale >
) {
	return defaultFormatter.setDefaultLocale( ...args );
}

export function setCurrencySymbol(
	...args: Parameters< typeof defaultFormatter.setCurrencySymbol >
) {
	return defaultFormatter.setCurrencySymbol( ...args );
}

export default defaultFormatter.formatCurrency;
