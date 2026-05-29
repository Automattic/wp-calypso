import { fetchCurrencyOverrides } from '@automattic/api-core';
import { setCurrencyOverrides } from '@automattic/number-formatters';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:i18n:currency-overrides' );

let pendingLoad: Promise< void > | null = null;

/**
 * Fetches the currency overrides from the wpcom endpoint and propagates them
 * to `@automattic/number-formatters`. The fetch is memoized so repeated calls
 * (e.g. from each locale switch) only hit the network once per page load.
 */
export function loadAndSetCurrencyOverrides(): Promise< void > {
	if ( typeof window === 'undefined' ) {
		return Promise.resolve();
	}

	if ( pendingLoad ) {
		return pendingLoad;
	}

	pendingLoad = fetchCurrencyOverrides()
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
