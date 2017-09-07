/**
 * Internal dependencies
 */
import {
	OAUTH2_CLIENT_DATA_REQUEST,
	OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
	OAUTH2_CLIENT_DATA_REQUEST_SUCCESS,
	OAUTH2_CLIENT_SIGNUP_URL_REQUEST,
	OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS,
	OAUTH2_CLIENT_SIGNUP_URL_REQUEST_FAILURE,
} from 'state/action-types';
import wpcom from 'lib/wp';
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

export const fetchOAuth2SignupUrl = redirectTo => dispatch => {
	dispatch( { type: OAUTH2_CLIENT_SIGNUP_URL_REQUEST } );

	return wpcom.undocumented().oauth2SignupUrl( redirectTo ).then(
		data => dispatch( { type: OAUTH2_CLIENT_SIGNUP_URL_REQUEST_SUCCESS, signupUrl: data.signup_url } ),
		wpcomError => {
			const error = convertWpcomError( wpcomError );

			dispatch( { type: OAUTH2_CLIENT_SIGNUP_URL_REQUEST_FAILURE, error } );

			return Promise.reject( error );
		}
	);
};
