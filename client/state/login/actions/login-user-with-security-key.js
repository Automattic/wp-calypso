import config from '@automattic/calypso-config';
import { get as webauthn_auth } from '@github/webauthn-json';
import { translate } from 'i18n-calypso';
import { get } from 'lodash';
import {
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { remoteLoginUser } from 'calypso/state/login/actions/remote-login-user';
import { updateNonce } from 'calypso/state/login/actions/update-nonce';
import { getTwoFactorAuthNonce, getTwoFactorUserId } from 'calypso/state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'calypso/state/login/utils';

import 'calypso/state/login/init';

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
		.then( ( response ) => {
			const parameters = get( response, 'body.data', [] );
			const twoStepNonce = get( parameters, 'two_step_nonce' );

			if ( twoStepNonce ) {
				dispatch( updateNonce( twoFactorAuthType, twoStepNonce ) );
			}
			return webauthn_auth( { publicKey: parameters } );
		} )
		.then( ( assertion ) => {
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
		.then( ( response ) => {
			return remoteLoginUser( get( response, 'body.data.token_links', [] ) ).then( () => {
				dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS } );
			} );
		} )
		.catch( ( httpError ) => {
			const twoStepNonce = get( httpError, 'response.body.data.two_step_nonce' );

			if ( twoStepNonce ) {
				dispatch( updateNonce( twoFactorAuthType, twoStepNonce ) );
			}

			const errorMessages = {
				NotFocusedError: translate(
					'It seems the page is not active for authentication. Please click anywhere on the page and try again while keeping the window open.'
				),
				NotAllowedError: translate(
					'The security key interaction timed out or was canceled. Please try again.'
				),
				AbortError: translate( 'The security key interaction was canceled. Please try again.' ),
				SecurityError: translate(
					"There’s a security restriction preventing us from accessing your credentials. Please check your browser's settings or permissions."
				),
				TypeError: translate(
					'There was an issue with the request. Please refresh the page and try again.'
				),
				default: translate( 'Oops! Something went wrong. Please try again.' ),
			};

			let error;
			if ( httpError instanceof Error ) {
				const errorKey = httpError.message.includes( 'document is not focused' )
					? 'NotFocusedError'
					: httpError.name;
				const message = errorMessages[ errorKey ] ?? errorMessages.default;
				error = { code: httpError.name, message, field: 'global' };
			} else {
				error = getErrorFromHTTPError( httpError );
			}

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};
