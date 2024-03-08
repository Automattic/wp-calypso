import { withStorageKey } from '@automattic/state-utils';
import { get, isEmpty, pick, startsWith } from 'lodash';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import {
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS,
	LOGIN_AUTH_ACCOUNT_TYPE_RESET,
	LOGIN_FORM_UPDATE,
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	ROUTE_SET,
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
	SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CONNECT_ACCOUNT_REQUEST,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CONNECT_ACCOUNT_LINKING_CANCEL,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
	SOCIAL_HANDOFF_CONNECT_ACCOUNT,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
	CURRENT_USER_RECEIVE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import magicLogin from './magic-login/reducer';

export const isRequesting = ( state = false, action ) => {
	switch ( action.type ) {
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST:
			return true;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE:
			return false;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS:
			return false;
		case LOGIN_REQUEST:
			return true;
		case LOGIN_REQUEST_FAILURE:
			return false;
		case LOGIN_REQUEST_SUCCESS:
			return false;
		case SOCIAL_LOGIN_REQUEST:
			return true;
		case SOCIAL_LOGIN_REQUEST_FAILURE:
			return false;
		case SOCIAL_LOGIN_REQUEST_SUCCESS:
			return false;
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST:
			return true;
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE:
			return false;
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS:
			return false;
	}

	return state;
};

export const redirectTo = combineReducers( {
	original: ( state = null, action ) => {
		switch ( action.type ) {
			case ROUTE_SET: {
				const { path, query } = action;
				if ( startsWith( path, '/log-in' ) ) {
					return query.redirect_to || state;
				} else if ( startsWith( path, '/start/account' ) ) {
					return query.redirect_to || state;
				} else if ( '/jetpack/connect/authorize' === path ) {
					return addQueryArgs( query, path );
				}

				return state;
			}
		}

		return state;
	},
	sanitized: ( state = null, action ) => {
		switch ( action.type ) {
			case LOGIN_REQUEST:
				return null;
			case LOGIN_REQUEST_FAILURE:
				return null;
			case LOGIN_REQUEST_SUCCESS: {
				const { data } = action;
				return get( data, 'redirect_to', null );
			}
			case SOCIAL_LOGIN_REQUEST:
				return null;
			case SOCIAL_LOGIN_REQUEST_FAILURE:
				return null;
			case SOCIAL_LOGIN_REQUEST_SUCCESS: {
				const { data } = action;
				return get( data, 'redirect_to', null );
			}
			case SOCIAL_CONNECT_ACCOUNT_REQUEST:
				return null;
			case SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE:
				return null;
			case SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS:
				return get( action, 'redirect_to', null );
		}

		return state;
	},
} );

export const isFormDisabled = ( state = false, action ) => {
	switch ( action.type ) {
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST:
			return true;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE:
			return false;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS:
			return false;
		case LOGIN_REQUEST:
			return true;
		case LOGIN_REQUEST_FAILURE:
			return false;
		case LOGIN_REQUEST_SUCCESS:
			return true;
		case ROUTE_SET:
			return false;
		case SOCIAL_LOGIN_REQUEST:
			return true;
		case SOCIAL_LOGIN_REQUEST_FAILURE:
			return false;
		case SOCIAL_LOGIN_REQUEST_SUCCESS:
			return true;
	}

	return state;
};

export const requestError = ( state = null, action ) => {
	switch ( action.type ) {
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST:
			return null;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS:
			return null;
		case LOGIN_AUTH_ACCOUNT_TYPE_RESET:
			return null;
		case LOGIN_REQUEST:
			return null;
		case LOGIN_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case LOGIN_REQUEST_SUCCESS:
			return null;
		case TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST:
			return null;
		case TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case SOCIAL_CONNECT_ACCOUNT_REQUEST:
			return null;
		case SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS:
			return null;
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST:
			return null;
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS:
			return null;
		case ROUTE_SET:
			return null;
		case LOGIN_FORM_UPDATE:
			return null;
	}

	return state;
};

export const requestSuccess = ( state = null, action ) => {
	switch ( action.type ) {
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST:
			return null;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE:
			return false;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS:
			return true;
		case LOGIN_REQUEST:
			return null;
		case LOGIN_REQUEST_FAILURE:
			return false;
		case LOGIN_REQUEST_SUCCESS:
			return true;
		case SOCIAL_CONNECT_ACCOUNT_REQUEST:
			return null;
		case SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS:
			return true;
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST:
			return null;
		case SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS:
			return true;
	}

	return state;
};

export const requestNotice = ( state = null, action ) => {
	switch ( action.type ) {
		case TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST: {
			const { notice } = action;
			return notice;
		}
		case TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE:
			return null;
		case TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS: {
			const { notice } = action;
			return notice;
		}
		case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE:
			return null;
		case ROUTE_SET: {
			// if we just navigated to the sms 2fa page, keep the notice (if any) from the loginUser action
			if ( action.path === login( { twoFactorAuthType: 'sms' } ) ) {
				return state;
			}
			return null;
		}
	}

	return state;
};

const updateTwoStepNonce = ( state, { twoStepNonce, nonceType } ) =>
	Object.assign( {}, state, {
		[ `two_step_nonce_${ nonceType }` ]: twoStepNonce,
	} );

const twoFactorProperties = [
	'push_web_token',
	'phone_number',
	'two_step_id',
	'two_step_nonce',
	'two_step_supported_auth_types',
	'two_step_notification_sent',
	'two_step_nonce_backup',
	'two_step_nonce_sms',
	'two_step_nonce_authenticator',
	'two_step_nonce_push',
	'two_step_nonce_webauthn',
	'user_id',
];

export const twoFactorAuth = ( state = null, action ) => {
	switch ( action.type ) {
		case LOGIN_REQUEST:
			return null;
		case LOGIN_REQUEST_FAILURE:
			return null;
		case LOGIN_REQUEST_SUCCESS: {
			const { data } = action;
			if ( data ) {
				const twoFactorData = pick( data, twoFactorProperties );

				if ( ! isEmpty( twoFactorData ) ) {
					return twoFactorData;
				}
			}

			return null;
		}
		case SOCIAL_LOGIN_REQUEST:
			return null;
		case SOCIAL_LOGIN_REQUEST_FAILURE:
			return null;
		case SOCIAL_LOGIN_REQUEST_SUCCESS: {
			const { data } = action;
			if ( data ) {
				const twoFactorData = pick( data, twoFactorProperties );

				if ( ! isEmpty( twoFactorData ) ) {
					return twoFactorData;
				}
			}

			return null;
		}
		case SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS:
			return null;
		case TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE: {
			const { twoStepNonce } = action;
			return updateTwoStepNonce( state, { twoStepNonce, nonceType: 'sms' } );
		}
		case TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS: {
			const { twoStepNonce } = action;
			return updateTwoStepNonce( state, { twoStepNonce, nonceType: 'sms' } );
		}
		case TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE:
			return updateTwoStepNonce( state, action );
	}

	return state;
};

export const twoFactorAuthRequestError = ( state = null, action ) => {
	switch ( action.type ) {
		case TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST:
			return null;
		case TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS:
			return null;
		case ROUTE_SET:
			return null;
		case LOGIN_FORM_UPDATE:
			return null;
	}

	return state;
};

export const socialAccount = ( state = { createError: null }, action ) => {
	switch ( action.type ) {
		case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE: {
			const { error } = action;

			return {
				createError: error,
			};
		}
		case SOCIAL_LOGIN_REQUEST_FAILURE: {
			const { error } = action;

			return {
				...state,
				requestError: error,
			};
		}
		case CURRENT_USER_RECEIVE:
			return {
				...state,
				bearerToken: null,
				username: null,
				createError: null,
			};
		case LOGIN_REQUEST:
			return { ...state, createError: null };
	}

	return state;
};

const userExistsErrorHandler = ( state, { error, authInfo } ) => {
	if ( error.code === 'user_exists' ) {
		return {
			isLinking: true,
			email: error.email,
			authInfo,
		};
	}

	return state;
};

export const socialAccountLink = ( state = { isLinking: false }, action ) => {
	switch ( action.type ) {
		case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE:
			return userExistsErrorHandler( state, action );
		case SOCIAL_HANDOFF_CONNECT_ACCOUNT:
			return {
				isLinking: true,
				email: action.email,
				authInfo: action.authInfo,
			};
		case SOCIAL_LOGIN_REQUEST_FAILURE:
			return userExistsErrorHandler( state, action );
		case SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS:
			return { isLinking: false };
		case CURRENT_USER_RECEIVE:
			return { isLinking: false };
		case SOCIAL_CONNECT_ACCOUNT_LINKING_CANCEL:
			return { isLinking: false };
	}

	return state;
};

export const authAccountType = ( state = null, action ) => {
	switch ( action.type ) {
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST:
			return null;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE:
			return null;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS: {
			const {
				data: { type },
			} = action;
			return type;
		}
		case LOGIN_AUTH_ACCOUNT_TYPE_RESET:
			return null;
		case ROUTE_SET:
			return null;
	}

	return state;
};

export const lastCheckedUsernameOrEmail = ( state = null, action ) => {
	switch ( action.type ) {
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST:
			return action.usernameOrEmail;
	}

	return state;
};

const combinedReducer = combineReducers( {
	authAccountType,
	isFormDisabled,
	isRequesting,
	lastCheckedUsernameOrEmail,
	magicLogin,
	redirectTo,
	requestError,
	requestNotice,
	requestSuccess,
	socialAccount,
	socialAccountLink,
	twoFactorAuth,
	twoFactorAuthRequestError,
} );

const loginReducer = withStorageKey( 'login', combinedReducer );
export default loginReducer;
