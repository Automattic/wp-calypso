import wpcom from 'calypso/lib/wp';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
} from '../action-types';

import 'calypso/state/reader/init';

const requestsInFlight = new Set();
export const requestUser = ( dispatch, ownProps ) => () => {
	return {
		requestUser: () => {
			const userId = ownProps.userId;
			if ( requestsInFlight.has( userId ) ) {
				return;
			}

			dispatch( {
				type: READER_USER_REQUEST,
				userId,
			} );

			requestsInFlight.add( userId );
			const removeKey = () => {
				requestsInFlight.delete( userId );
			};

			return wpcom.req
				.get( `/users/${ encodeURIComponent( userId ) }/` )
				.then( ( userData ) => {
					removeKey();
					dispatch( receiveUser( userId, userData ) );
				} )
				.catch( ( error ) => {
					removeKey();
					dispatch( handleReaderListRequestFailure( userId, error ) );
				} );
		},
	};
};

export function receiveUser( userId, userData ) {
	return {
		type: READER_USER_REQUEST_SUCCESS,
		userId,
		userData,
	};
}

export function handleReaderListRequestFailure( userId, error ) {
	return {
		type: READER_USER_REQUEST_FAILURE,
		userId,
		error,
	};
}
