import { setCurrencyOverrides } from '@automattic/number-formatters';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:i18n:currency-overrides' );

const CURRENCY_OVERRIDES_URL = 'https://public-api.wordpress.com/wpcom/v2/currency-overrides';

let pendingLoad = null;

/**
 * Fetches the currency overrides from the wpcom endpoint and propagates them
 * to `@automattic/number-formatters`. The fetch is memoized so repeated calls
 * (e.g. from each locale switch) only hit the network once per page load.
 * @returns {Promise<void>}
 */
export function loadAndSetCurrencyOverrides() {
	if ( typeof window === 'undefined' ) {
		return Promise.resolve();
	}

	if ( pendingLoad ) {
		return pendingLoad;
	}

	pendingLoad = globalThis
		.fetch( CURRENCY_OVERRIDES_URL )
		.then( ( response ) => {
			if ( ! response.ok ) {
				throw new Error( `Unexpected status ${ response.status }` );
			}
			return response.json();
		} )
		.then( ( overrides ) => {
			if ( overrides && typeof overrides === 'object' ) {
				setCurrencyOverrides( overrides );
			}
		} )
		.catch( ( error ) => {
			debug( 'Failed to load currency overrides', error );
			// Allow a retry on the next call if the fetch failed.
			pendingLoad = null;
		} );

	return pendingLoad;
}
