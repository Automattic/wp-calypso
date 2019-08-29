/** @format */

/**
 * External dependencies
 */

import { get, isEmpty, pick, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
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

export const isRequesting = createReducer( false, {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST ]: () => true,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE ]: () => false,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS ]: () => false,
	[ LOGIN_REQUEST ]: () => true,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
	[ LOGIN_REQUEST_SUCCESS ]: () => false,
	[ SOCIAL_LOGIN_REQUEST ]: () => true,
	[ SOCIAL_LOGIN_REQUEST_FAILURE ]: () => false,
	[ SOCIAL_LOGIN_REQUEST_SUCCESS ]: () => false,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST ]: () => true,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE ]: () => false,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS ]: () => false,
} );

export const redirectTo = combineReducers( {
	original: createReducer( null, {
		[ ROUTE_SET ]: ( state, { path, query } ) => {
			if ( startsWith( path, '/log-in' ) ) {
				return query.redirect_to || state;
			}

			return state;
		},
	} ),
	sanitized: createReducer( null, {
		[ LOGIN_REQUEST ]: () => null,
		[ LOGIN_REQUEST_FAILURE ]: () => null,
		[ LOGIN_REQUEST_SUCCESS ]: ( state, { data } ) => get( data, 'redirect_to', null ),
		[ SOCIAL_LOGIN_REQUEST ]: () => null,
		[ SOCIAL_LOGIN_REQUEST_FAILURE ]: () => null,
		[ SOCIAL_LOGIN_REQUEST_SUCCESS ]: ( state, { data } ) => get( data, 'redirect_to', null ),
		[ SOCIAL_CONNECT_ACCOUNT_REQUEST ]: () => null,
		[ SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE ]: () => null,
		[ SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS ]: ( state, action ) =>
			get( action, 'redirect_to', null ),
	} ),
} );

export const isFormDisabled = createReducer( null, {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST ]: () => true,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE ]: () => false,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS ]: () => false,
	[ LOGIN_REQUEST ]: () => true,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
	[ LOGIN_REQUEST_SUCCESS ]: () => true,
	[ ROUTE_SET ]: () => false,
	[ SOCIAL_LOGIN_REQUEST ]: () => true,
	[ SOCIAL_LOGIN_REQUEST_FAILURE ]: () => false,
	[ SOCIAL_LOGIN_REQUEST_SUCCESS ]: () => true,
} );

export const requestError = createReducer( null, {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST ]: () => null,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS ]: () => null,
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ LOGIN_REQUEST_SUCCESS ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST ]: () => null,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS ]: () => null,
	[ SOCIAL_CONNECT_ACCOUNT_REQUEST ]: () => null,
	[ SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS ]: () => null,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST ]: () => null,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS ]: () => null,
	[ ROUTE_SET ]: () => null,
	[ LOGIN_FORM_UPDATE ]: () => null,
} );

export const requestSuccess = createReducer( null, {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST ]: () => null,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE ]: () => false,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS ]: () => true,
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
	[ LOGIN_REQUEST_SUCCESS ]: () => true,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST ]: () => null,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS ]: () => true,
	[ SOCIAL_CONNECT_ACCOUNT_REQUEST ]: () => null,
	[ SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS ]: () => true,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST ]: () => null,
	[ SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS ]: () => true,
} );

export const requestNotice = createReducer( null, {
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST ]: ( state, { notice } ) => notice,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS ]: ( state, { notice } ) => notice,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST ]: ( state, { notice } ) => notice,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE ]: () => null,
	[ ROUTE_SET ]: ( state, action ) => {
		// if we just navigated to the sms 2fa page, keep the notice (if any) from the loginUser action
		if ( action.path === login( { isNative: true, twoFactorAuthType: 'sms' } ) ) {
			return state;
		}
		return null;
	},
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
	'user_id',
];

export const twoFactorAuth = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_FAILURE ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: ( state, { data } ) => {
		if ( data ) {
			const twoFactorData = pick( data, twoFactorProperties );

			if ( ! isEmpty( twoFactorData ) ) {
				return twoFactorData;
			}
		}

		return null;
	},
	[ SOCIAL_LOGIN_REQUEST ]: () => null,
	[ SOCIAL_LOGIN_REQUEST_FAILURE ]: () => null,
	[ SOCIAL_LOGIN_REQUEST_SUCCESS ]: ( state, { data } ) => {
		if ( data ) {
			const twoFactorData = pick( data, twoFactorProperties );

			if ( ! isEmpty( twoFactorData ) ) {
				return twoFactorData;
			}
		}

		return null;
	},
	[ SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE ]: ( state, { twoStepNonce } ) =>
		updateTwoStepNonce( state, { twoStepNonce, nonceType: 'sms' } ),
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS ]: ( state, { twoStepNonce } ) =>
		updateTwoStepNonce( state, { twoStepNonce, nonceType: 'sms' } ),
	[ TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE ]: updateTwoStepNonce,
} );

export const isRequestingTwoFactorAuth = createReducer( false, {
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST ]: () => true,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE ]: () => false,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS ]: () => false,
} );

export const twoFactorAuthRequestError = createReducer( null, {
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS ]: () => null,
	[ ROUTE_SET ]: () => null,
	[ LOGIN_FORM_UPDATE ]: () => null,
} );

export const twoFactorAuthPushPoll = createReducer(
	{ inProgress: false, success: false },
	{
		[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: state => ( {
			...state,
			inProgress: true,
			success: false,
		} ),
		[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP ]: state => ( { ...state, inProgress: false } ),
		[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED ]: state => ( {
			...state,
			inProgress: false,
			success: true,
		} ),
	}
);

export const socialAccount = createReducer(
	{ isCreating: false, createError: null },
	{
		[ SOCIAL_CREATE_ACCOUNT_REQUEST ]: () => ( { isCreating: true } ),
		[ SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE ]: ( state, { error } ) => ( {
			isCreating: false,
			createError: error,
		} ),
		[ SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS ]: ( state, { data: { username, bearerToken } } ) => ( {
			isCreating: false,
			username,
			bearerToken,
			createError: null,
		} ),
		[ SOCIAL_LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => ( {
			...state,
			requestError: error,
		} ),
		[ CURRENT_USER_RECEIVE ]: state => ( {
			...state,
			bearerToken: null,
			username: null,
			createError: null,
		} ),
		[ LOGIN_REQUEST ]: state => ( { ...state, createError: null } ),
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

export const socialAccountLink = createReducer(
	{ isLinking: false },
	{
		[ SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE ]: userExistsErrorHandler,
		[ SOCIAL_LOGIN_REQUEST_FAILURE ]: userExistsErrorHandler,
		[ SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS ]: () => ( { isLinking: false } ),
		[ SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS ]: () => ( { isLinking: false } ),
		[ CURRENT_USER_RECEIVE ]: () => ( { isLinking: false } ),
	}
);

export const authAccountType = createReducer( null, {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST ]: () => null,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE ]: () => null,
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS ]: ( state, { data: { type } } ) => type,
	[ LOGIN_AUTH_ACCOUNT_TYPE_RESET ]: () => null,
	[ ROUTE_SET ]: () => null,
} );

export default combineReducers( {
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
