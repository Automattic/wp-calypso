import wpcom from 'calypso/lib/wp';
import {
	READER_USER__REQUEST,
	READER_USER__REQUEST_SUCCESS,
	READER_USER__REQUEST_FAILURE,
} from '../action-types';

import 'calypso/state/reader/init';

const requestsInFlight = new Set();
export function requestUser( userId ) {
	return async ( dispatch ) => {
		if ( requestsInFlight.has( userId ) ) {
			return;
		}

		dispatch( { type: READER_USER__REQUEST, userId } );
		requestsInFlight.add( userId );

		try {
			const userData = await wpcom.req.get( `/users/${ encodeURIComponent( userId ) }/` );
			requestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER__REQUEST_SUCCESS,
				userId,
				userData,
			} );
		} catch ( error ) {
			requestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER__REQUEST_FAILURE,
				userId,
				error,
			} );
		}
	};
}
