import wpcom from 'calypso/lib/wp';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
} from '../action-types';

import 'calypso/state/reader/init';

const requestsInFlight = new Set();
export function requestUser( userId ) {
	return async ( dispatch ) => {
		if ( requestsInFlight.has( userId ) ) {
			return;
		}

		dispatch( { type: READER_USER_REQUEST, userId } );
		requestsInFlight.add( userId );

		try {
			const userData = await wpcom.req.get( `/users/${ encodeURIComponent( userId ) }/` );
			requestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER_REQUEST_SUCCESS,
				userId,
				userData,
			} );
		} catch ( error ) {
			requestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER_REQUEST_FAILURE,
				userId,
				error,
			} );
		}
	};
}
