const formatterCache = new Map();
const fallbackLocale = 'en';

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
	// TODO clk numberFormatCurrency this can all go. it's just a static string added to locale
	const numberingSystem = 'latn';
	const numberingSystemUnicodeLocaleExtension = `-u-nu-${ numberingSystem }`;
	const localeWithNumberingSystem = `${ locale }${ numberingSystemUnicodeLocaleExtension }`;
	return localeWithNumberingSystem;
}

/**
 * Creating an Intl.NumberFormat is expensive, so this allows caching.
 *
 * TODO clk numberFormatCurrency Caching logic now same as numberFormat, except for fallback.
 * TODO clk numberFormatCurrency This should replace numberFormat's caching logic, after some cleanup (remove console.warn).
 */
export function getCachedFormatter( {
	locale,
	options,
}: {
	locale: string;
	options?: Intl.NumberFormatOptions;
} ): Intl.NumberFormat {
	const cacheKey = JSON.stringify( [ locale, options ] );

	try {
		return (
			formatterCache.get( cacheKey ) ??
			formatterCache
				.set( cacheKey, new Intl.NumberFormat( addNumberingSystemToLocale( locale ), options ) )
				.get( cacheKey )
		);
	} catch ( error ) {
		// If the locale is invalid, creating the NumberFormat will throw.
		// eslint-disable-next-line no-console
		console.warn(
			`Intl.NumberFormat was called with a non-existent locale "${ locale }"; falling back to ${ fallbackLocale }`
		);

		return getCachedFormatter( {
			locale: fallbackLocale,
			options,
		} );
	}
}
