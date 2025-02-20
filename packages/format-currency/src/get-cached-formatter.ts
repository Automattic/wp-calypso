const formatterCache = new Map();

/**
 * Creating an Intl.NumberFormat is expensive, so this allows caching.
 *
 * TODO clk numberFormatCurrency Caching logic now same as numberFormat, except for fallback.
 * TODO clk numberFormatCurrency This should replace numberFormat's caching logic, after some cleanup (remove console.warn).
 */
export function getCachedFormatter( {
	locale,
	fallbackLocale = 'en',
	options,
}: {
	locale: string;
	fallbackLocale?: string;
	options?: Intl.NumberFormatOptions;
} ): Intl.NumberFormat {
	const cacheKey = JSON.stringify( [ locale, options ] );

	try {
		return (
			formatterCache.get( cacheKey ) ??
			formatterCache.set( cacheKey, new Intl.NumberFormat( locale, options ) ).get( cacheKey )
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
