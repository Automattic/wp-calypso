export interface DateRangeSearch {
	from?: number;
	to?: number;
}

/**
 * Parse a `from`/`to` URL param as Unix seconds. Values of 1e12 and above are treated as
 * milliseconds, which older versions of the logs page used in shared links.
 */
export function parseUnixSecondsParam( value: unknown ): number | undefined {
	const num = typeof value === 'number' ? value : Number.parseInt( String( value ?? '' ), 10 );
	if ( ! Number.isFinite( num ) ) {
		return undefined;
	}
	return num >= 1e12 ? Math.floor( num / 1000 ) : Math.floor( num );
}

/**
 * `validateSearch` for routes that show a date range picker. Normalizes `from`/`to` to
 * Unix seconds and drops reversed ranges; the router rewrites the URL to match.
 */
export function validateDateRangeSearch( search: Record< string, unknown > ): DateRangeSearch {
	const from = parseUnixSecondsParam( search.from );
	const to = parseUnixSecondsParam( search.to );
	if ( from !== undefined && to !== undefined && from > to ) {
		return { from: undefined, to: undefined };
	}
	return { from, to };
}
