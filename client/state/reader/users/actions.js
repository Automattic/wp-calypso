import wpcom from 'calypso/lib/wp';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
} from '../action-types';

import 'calypso/state/reader/init';

const requestsInFlight = new Set();
export function requestUser( userLogin ) {
	return async ( dispatch ) => {
		if ( requestsInFlight.has( userLogin ) ) {
			return;
		}

		dispatch( { type: READER_USER_REQUEST, userLogin } );
		requestsInFlight.add( userLogin );

		try {
			const userData = await wpcom.req.get( `/users/${ encodeURIComponent( userLogin ) }/` );
			requestsInFlight.delete( userLogin );
			dispatch( {
				type: READER_USER_REQUEST_SUCCESS,
				userLogin,
				userData,
			} );
		} catch ( error ) {
			requestsInFlight.delete( userLogin );
			dispatch( {
				type: READER_USER_REQUEST_FAILURE,
				userLogin,
				error,
			} );
		}
	};
}
