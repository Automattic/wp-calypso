/** @format */

/**
 * Internal dependencies
 */

import {
	OAUTH2_CLIENT_DATA_REQUEST,
	OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
} from 'client/state/action-types';
import wpcom from 'client/lib/wp';
import { cachingActionCreatorFactory } from 'client/state/utils';

const convertWpcomError = wpcomError => ( {
	message: wpcomError.message,
	code: wpcomError.error,
} );

export const fetchOAuth2ClientData = cachingActionCreatorFactory(
	clientId => wpcom.undocumented().oauth2ClientId( clientId ),
	dispatch => clientId => dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST, clientId } ),
	dispatch => wpcomResponse =>
		dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS, data: wpcomResponse } ),
	dispatch => wpcomError => {
		const error = convertWpcomError( wpcomError );

		dispatch( {
			type: OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
			error,
		} );

		return Promise.reject( error );
	}
);
