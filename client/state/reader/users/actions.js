import wpcom from 'calypso/lib/wp';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
} from '../action-types';

import 'calypso/state/reader/init';

const requestsInFlight = new Set();
export function requestUser( userLoginOrId, findById = false ) {
	return async ( dispatch ) => {
		if ( requestsInFlight.has( userLoginOrId ) ) {
			return;
		}

		dispatch( { type: READER_USER_REQUEST, userLogin: userLoginOrId } );
		requestsInFlight.add( userLoginOrId );

		try {
			const userData = await wpcom.req.get(
				`/users/${ encodeURIComponent( userLoginOrId ) }/${ findById ? '?find_by_id=true' : '' }`
			);
			requestsInFlight.delete( userLoginOrId );
			dispatch( {
				type: READER_USER_REQUEST_SUCCESS,
				// If we find by ID, setting by user_login allows a quick redirect to the normal
				// route prettified by username without needing to re-fetch the user. However, for
				// the standard use we must set by the original requested input to continue being
				// able to handle the fallback case of the ID being used in the username route.
				userLogin: findById ? userData.user_login : userLoginOrId,
				userData,
			} );
		} catch ( error ) {
			requestsInFlight.delete( userLoginOrId );
			dispatch( {
				type: READER_USER_REQUEST_FAILURE,
				userLogin: userLoginOrId,
				error,
			} );
		}
	};
}
