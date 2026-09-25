import { getPreparedCheckoutSource } from './sources';
import type { PreparedCheckoutSource } from './sources';

export const PREPARE_QUERY_ARG = 'prepare';
export const SKIP_ACTIVE_CART_QUERY_ARG = 'skip_active_cart';

export interface PreparedCheckoutRequest {
	source: PreparedCheckoutSource;
	/** Raw string values exactly as they appeared on the URL. */
	params: Record< string, string >;
}

export type PreparedCheckoutRequestResult =
	| { status: 'none' }
	| { status: 'reload' }
	| { status: 'unknown_source'; sourceId: string }
	| { status: 'incomplete'; source: PreparedCheckoutSource; missing: string[] }
	| { status: 'ready'; request: PreparedCheckoutRequest };

/**
 * Classify the checkout page's query string.
 *
 * - `prepare=<source>` plus that source's params: a fresh prepared-checkout request.
 * - `skip_active_cart=1` alone: a reload of an already prepared checkout.
 * - Otherwise: normal Marketplace checkout.
 *
 * Accepts the string with or without its leading `?` (page.js hands over
 * `context.querystring` without one).
 */
export function getPreparedCheckoutRequest( search: string ): PreparedCheckoutRequestResult {
	const query = new URLSearchParams( search );
	const sourceId = query.get( PREPARE_QUERY_ARG );

	if ( sourceId === null ) {
		return query.get( SKIP_ACTIVE_CART_QUERY_ARG ) === '1'
			? { status: 'reload' }
			: { status: 'none' };
	}

	const source = getPreparedCheckoutSource( sourceId );
	if ( ! source ) {
		return { status: 'unknown_source', sourceId };
	}

	const params: Record< string, string > = {};
	const missing: string[] = [];

	for ( const name of source.requiredParams ) {
		const value = query.get( name );
		if ( value === null || value === '' ) {
			missing.push( name );
		} else {
			params[ name ] = value;
		}
	}

	for ( const name of source.optionalParams ) {
		const value = query.get( name );
		if ( value !== null ) {
			params[ name ] = value;
		}
	}

	if ( missing.length ) {
		return { status: 'incomplete', source, missing };
	}

	return { status: 'ready', request: { source, params } };
}
