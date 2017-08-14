/**
 * Internal dependencies
 */
import {
	OAUTH2_CLIENT_DATA_REQUEST,
	OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
} from 'state/action-types';
import wpcom from 'lib/wp';

export const fetchOAuth2ClientData = ( clientId ) => dispatch => {
	dispatch( {
		type: OAUTH2_CLIENT_DATA_REQUEST,
		clientId,
	} );

	return wpcom.undocumented().oauth2ClientId( clientId ).then( wpcomResponse => {
		dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS, data: wpcomResponse } );

		return wpcomResponse;
	}, wpcomError => {
		const error = {
			message: wpcomError.message,
			code: wpcomError.error,
		};

		dispatch( {
			type: OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
			error,
		} );

		return Promise.reject( error );
	} );
};
