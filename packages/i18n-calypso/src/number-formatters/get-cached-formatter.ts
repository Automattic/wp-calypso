const formatterCache = new Map();

interface Params {
	locale: string;
	options?: Intl.NumberFormatOptions;
	fallbackLocale?: string;
	retries?: number;
}

export function getCachedFormatter( {
	locale,
	fallbackLocale = 'en',
	options,
	retries = 1,
}: Params ): Intl.NumberFormat {
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

		if ( retries ) {
			return getCachedFormatter( {
				locale: fallbackLocale,
				options,
				retries: retries - 1,
			} );
		}

		throw error;
	}
}
