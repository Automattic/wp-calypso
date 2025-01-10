import wpcom from 'calypso/lib/wp';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
	READER_USER_LISTS_REQUEST,
	READER_USER_LISTS_REQUEST_SUCCESS,
	READER_USER_LISTS_REQUEST_FAILURE,
} from '../action-types';

import 'calypso/state/reader/init';

const userRequestsInFlight = new Set();
export function requestUser( userId ) {
	return async ( dispatch ) => {
		if ( userRequestsInFlight.has( userId ) ) {
			return;
		}

		dispatch( { type: READER_USER_REQUEST, userId } );
		userRequestsInFlight.add( userId );

		try {
			const userData = await wpcom.req.get( `/users/${ encodeURIComponent( userId ) }/` );
			userRequestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER_REQUEST_SUCCESS,
				userId,
				userData,
			} );
		} catch ( error ) {
			userRequestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER_REQUEST_FAILURE,
				userId,
				error,
			} );
		}
	};
}

const listRequestsInFlight = new Set();
export function requestUserLists( userId, userSlug ) {
	return async ( dispatch ) => {
		if ( listRequestsInFlight.has( userId ) ) {
			return;
		}

		dispatch( { type: READER_USER_LISTS_REQUEST, userId } );
		listRequestsInFlight.add( userId );

		try {
			const userData = await wpcom.req.get( `/read/lists/${ encodeURIComponent( userSlug ) }/` );
			listRequestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER_LISTS_REQUEST_SUCCESS,
				userId,
				userData,
			} );
		} catch ( error ) {
			listRequestsInFlight.delete( userId );
			dispatch( {
				type: READER_USER_LISTS_REQUEST_FAILURE,
				userId,
				error,
			} );
		}
	};
}
