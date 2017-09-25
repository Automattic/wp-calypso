/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { OAUTH2_CLIENT_DATA_REQUEST, OAUTH2_CLIENT_DATA_REQUEST_FAILURE, OAUTH2_CLIENT_DATA_REQUEST_SUCCESS } from 'state/action-types';
import { cachingActionCreatorFactory } from 'state/utils';

const convertWpcomError = wpcomError => ( {
	message: wpcomError.message,
	code: wpcomError.error,
} );

export const fetchOAuth2ClientData = cachingActionCreatorFactory(
	clientId => wpcom.undocumented().oauth2ClientId( clientId ),
	dispatch => clientId => dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST, clientId, } ),
	dispatch => wpcomResponse => dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS, data: wpcomResponse } ),
	dispatch => wpcomError => {
		const error = convertWpcomError( wpcomError );

		dispatch( {
			type: OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
			error,
		} );

		return Promise.reject( error );
	},
);
