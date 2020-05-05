/**
 * External dependencies
 */
import { get, isEmpty, pick, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence, withStorageKey } from 'state/utils';
import magicLogin from './magic-login/reducer';
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
	SOCIAL_CREATE_ACCOUNT_REQUEST,
	SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS,
	SOCIAL_CONNECT_ACCOUNT_REQUEST,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
	CURRENT_USER_RECEIVE,
} from 'state/action-types';
import { login } from 'lib/paths';

export const isRequesting = withoutPersistence( ( state = false, action ) => {
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
} );

export const redirectTo = combineReducers( {
	original: withoutPersistence( ( state = null, action ) => {
		switch ( action.type ) {
			case ROUTE_SET: {
				const { path, query } = action;
				if ( startsWith( path, '/log-in' ) ) {
					return query.redirect_to || state;
				}

				return state;
			}
		}

		return state;
	} ),
	sanitized: withoutPersistence( ( state = null, action ) => {
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
	} ),
} );

export const isFormDisabled = withoutPersistence( ( state = null, action ) => {
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
} );

export const requestError = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST:
			return null;
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS:
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
		case SOCIAL_CREATE_ACCOUNT_REQUEST:
			return null;
		case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE: {
			const { error } = action;
			return error;
		}
		case SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS:
			return null;
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
} );

export const requestSuccess = withoutPersistence( ( state = null, action ) => {
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
		case SOCIAL_CREATE_ACCOUNT_REQUEST:
			return null;
		case SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS:
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
} );

export const requestNotice = withoutPersistence( ( state = null, action ) => {
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
		case SOCIAL_CREATE_ACCOUNT_REQUEST: {
			const { notice } = action;
			return notice;
		}
		case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE:
			return null;
		case ROUTE_SET: {
			// if we just navigated to the sms 2fa page, keep the notice (if any) from the loginUser action
			if ( action.path === login( { isNative: true, twoFactorAuthType: 'sms' } ) ) {
				return state;
			}
			return null;
		}
	}

	return state;
} );

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

export const twoFactorAuth = withoutPersistence( ( state = null, action ) => {
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
} );

export const isRequestingTwoFactorAuth = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST:
			return true;
		case TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE:
			return false;
		case TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

export const twoFactorAuthRequestError = withoutPersistence( ( state = null, action ) => {
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
} );

export const twoFactorAuthPushPoll = withoutPersistence(
	( state = { inProgress: false, success: false }, action ) => {
		switch ( action.type ) {
			case TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START:
				return {
					...state,
					inProgress: true,
					success: false,
				};
			case TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP:
				return { ...state, inProgress: false };
			case TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED:
				return {
					...state,
					inProgress: false,
					success: true,
				};
		}

		return state;
	}
);

export const socialAccount = withoutPersistence(
	( state = { isCreating: false, createError: null }, action ) => {
		switch ( action.type ) {
			case SOCIAL_CREATE_ACCOUNT_REQUEST:
				return { isCreating: true };
			case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE: {
				const { error } = action;

				return {
					isCreating: false,
					createError: error,
				};
			}
			case SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS: {
				const {
					data: { username, bearerToken },
				} = action;

				return {
					isCreating: false,
					username,
					bearerToken,
					createError: null,
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
	}
);

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

export const socialAccountLink = withoutPersistence( ( state = { isLinking: false }, action ) => {
	switch ( action.type ) {
		case SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE:
			return userExistsErrorHandler( state, action );
		case SOCIAL_LOGIN_REQUEST_FAILURE:
			return userExistsErrorHandler( state, action );
		case SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS:
			return { isLinking: false };
		case SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS:
			return { isLinking: false };
		case CURRENT_USER_RECEIVE:
			return { isLinking: false };
	}

	return state;
} );

export const authAccountType = withoutPersistence( ( state = null, action ) => {
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
} );

const combinedReducer = combineReducers( {
	authAccountType,
	isFormDisabled,
	isRequesting,
	isRequestingTwoFactorAuth,
	magicLogin,
	redirectTo,
	requestError,
	requestNotice,
	requestSuccess,
	socialAccount,
	socialAccountLink,
	twoFactorAuth,
	twoFactorAuthPushPoll,
	twoFactorAuthRequestError,
} );

const loginReducer = withStorageKey( 'login', combinedReducer );
export default loginReducer;
