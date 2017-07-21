/**
 * External dependencies
 */
import { get, isEmpty, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import magicLogin from './magic-login/reducer';
import {
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
	USER_RECEIVE,
} from 'state/action-types';
import { login } from 'lib/paths';

export const isRequesting = createReducer( false, {
	[ LOGIN_REQUEST ]: () => true,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
	[ LOGIN_REQUEST_SUCCESS ]: () => false,
} );

export const redirectTo = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: ( state, { data } ) => get( data, 'redirect_to', null ),
	[ LOGIN_REQUEST_FAILURE ]: () => null,
	[ SOCIAL_LOGIN_REQUEST ]: () => null,
	[ SOCIAL_LOGIN_REQUEST_SUCCESS ]: ( state, action ) => get( action, 'redirectTo', null ),
	[ SOCIAL_LOGIN_REQUEST_FAILURE ]: () => null,
} );

export const rememberMe = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: ( state, action ) => action.rememberMe,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
} );

export const requestError = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: () => null,
	[ LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST ]: () => null,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS ]: () => null,
	[ ROUTE_SET ]: () => null,
} );

export const requestSuccess = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: () => true,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS ]: () => true,
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

const updateTwoStepNonce = ( state, { twoStepNonce, nonceType } ) => Object.assign( {}, state, {
	[ `two_step_nonce_${ nonceType }` ]: twoStepNonce
} );

export const twoFactorAuth = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: ( state, { data } ) => {
		if ( data ) {
			const rest = omit( data, 'redirect_to' );

			if ( ! isEmpty( rest ) ) {
				return rest;
			}
		}

		return null;
	},
	[ LOGIN_REQUEST_FAILURE ]: () => null,
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
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ ROUTE_SET ]: () => null,
} );

export const twoFactorAuthPushPoll = createReducer( { inProgress: false, success: false }, {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: state => ( { ...state, inProgress: true, success: false } ),
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP ]: state => ( { ...state, inProgress: false } ),
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED ]: state => ( { ...state, inProgress: false, success: true } ),
} );

export const socialAccount = createReducer( { isCreating: false }, {
	[ SOCIAL_CREATE_ACCOUNT_REQUEST ]: () => ( { isCreating: true } ),
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE ]: ( state, { error } ) => ( { isCreating: false, createError: error } ),
	[ SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS ]: ( state, { data: { username, bearerToken } } ) => ( {
		isCreating: false,
		username,
		bearerToken
	} ),
	[ SOCIAL_LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => ( {
		...state,
		requestError: error
	} ),
	[ USER_RECEIVE ]: state => ( { ...state, bearerToken: null, username: null } ),
	[ LOGIN_REQUEST ]: state => ( { ...state, createError: null } ),
} );

export default combineReducers( {
	isRequesting,
	isRequestingTwoFactorAuth,
	magicLogin,
	redirectTo,
	rememberMe,
	requestError,
	requestNotice,
	requestSuccess,
	twoFactorAuth,
	twoFactorAuthRequestError,
	twoFactorAuthPushPoll,
	socialAccount,
} );
