import LRU from 'lru';
import wpcom from 'calypso/lib/wp';
import { OAUTH2_CLIENT_DATA_RECEIVE } from 'calypso/state/action-types';

import 'calypso/state/oauth2-clients/init';

// Store the REST endpoint responses in a LRU cache. That's useful in a server context,
// where the fetch is done when handling SSR-ed login and signup routes. Cache is shared
// by all clients, but the Redux store where the result is dispatched to is different each time.
const cache = new LRU( {
	max: 100,
	maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
} );

const convertWpcomError = ( wpcomError ) => ( {
	message: wpcomError.message,
	code: wpcomError.error,
} );

export const fetchOAuth2ClientData = ( clientId ) => async ( dispatch ) => {
	const cacheKey = String( clientId );

	try {
		let data = cache.get( cacheKey );
		if ( data === undefined ) {
			data = await wpcom.req.get( `/oauth2/client-data/${ clientId }`, {
				apiNamespace: 'wpcom/v2',
			} );
			cache.set( cacheKey, data );
		}

		dispatch( { type: OAUTH2_CLIENT_DATA_RECEIVE, data } );
		return data;
	} catch ( error ) {
		throw convertWpcomError( error );
	}
};
