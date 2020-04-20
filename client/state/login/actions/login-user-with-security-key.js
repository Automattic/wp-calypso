/**
 * External dependencies
 */
import { get } from 'lodash';
import { get as webauthn_auth } from '@github/webauthn-json';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
} from 'state/action-types';
import { getTwoFactorAuthNonce, getTwoFactorUserId } from 'state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'state/login/utils';

import { remoteLoginUser } from 'state/login/actions/remote-login-user';
import { updateNonce } from 'state/login/actions/update-nonce';

import 'state/login/init';

export const loginUserWithSecurityKey = () => ( dispatch, getState ) => {
	const twoFactorAuthType = 'webauthn';
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST } );
	const loginParams = {
		user_id: getTwoFactorUserId( getState() ),
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		auth_type: twoFactorAuthType,
	};
	return postLoginRequest( 'webauthn-challenge-endpoint', {
		...loginParams,
		two_step_nonce: getTwoFactorAuthNonce( getState(), twoFactorAuthType ),
	} )
		.then( response => {
			const parameters = get( response, 'body.data', [] );
			const twoStepNonce = get( parameters, 'two_step_nonce' );

			if ( twoStepNonce ) {
				dispatch( updateNonce( twoFactorAuthType, twoStepNonce ) );
			}
			return webauthn_auth( { publicKey: parameters } );
		} )
		.then( assertion => {
			const response = assertion.response;
			if ( typeof response.userHandle !== 'undefined' && null === response.userHandle ) {
				delete response.userHandle;
			}
			return postLoginRequest( 'webauthn-authentication-endpoint', {
				...loginParams,
				client_data: JSON.stringify( assertion ),
				two_step_nonce: getTwoFactorAuthNonce( getState(), twoFactorAuthType ),
				remember_me: true,
			} );
		} )
		.then( response => {
			return remoteLoginUser( get( response, 'body.data.token_links', [] ) ).then( () => {
				dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS } );
			} );
		} )
		.catch( httpError => {
			const twoStepNonce = get( httpError, 'response.body.data.two_step_nonce' );

			if ( twoStepNonce ) {
				dispatch( updateNonce( twoFactorAuthType, twoStepNonce ) );
			}

			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};
