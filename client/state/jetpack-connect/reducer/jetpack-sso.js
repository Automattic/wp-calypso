/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR,
} from 'calypso/state/jetpack-connect/action-types';

export default function jetpackSSO( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_SSO_VALIDATION_REQUEST:
			return Object.assign( {}, state, { isValidating: true } );
		case JETPACK_CONNECT_SSO_VALIDATION_SUCCESS:
			return Object.assign( {}, state, {
				isValidating: false,
				validationError: false,
				nonceValid: action.success,
				blogDetails: action.blogDetails,
				sharedDetails: action.sharedDetails,
			} );
		case JETPACK_CONNECT_SSO_VALIDATION_ERROR:
			return Object.assign( {}, state, {
				isValidating: false,
				validationError: action.error,
				nonceValid: false,
			} );
		case JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST:
			return Object.assign( {}, state, { isAuthorizing: true } );
		case JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS:
			return Object.assign( {}, state, {
				isAuthorizing: false,
				authorizationError: false,
				ssoUrl: action.ssoUrl,
			} );
		case JETPACK_CONNECT_SSO_AUTHORIZE_ERROR:
			return Object.assign( {}, state, {
				isAuthorizing: false,
				authorizationError: action.error,
				ssoUrl: false,
			} );
	}
	return state;
}
