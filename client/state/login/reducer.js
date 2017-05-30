/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import magicLogin from './magic-login/reducer';
import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_PUSH_REQUEST,
	TWO_FACTOR_AUTHENTICATION_PUSH_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_PUSH_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
} from 'state/action-types';

export const isRequesting = createReducer( false, {
	[ LOGIN_REQUEST ]: () => true,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
	[ LOGIN_REQUEST_SUCCESS ]: () => false,
} );

export const requestError = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: () => null,
	[ LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => error,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE ]: ( state, { error } ) => error,
} );

export const requestSuccess = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: () => true,
	[ LOGIN_REQUEST_FAILURE ]: () => false,
} );

export const requestNotice = createReducer( null, {
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST ]: ( state, { notice } ) => notice,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS ]: ( state, { notice } ) => notice
} );

const updateTwoStepNonce = ( state, { twoStepNonce } ) => Object.assign( {}, state, {
	two_step_nonce: twoStepNonce
} );

export const twoFactorAuth = createReducer( null, {
	[ LOGIN_REQUEST ]: () => null,
	[ LOGIN_REQUEST_SUCCESS ]: ( state, { data, rememberMe } ) => data ? { ...data, remember_me: rememberMe } : null,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE ]: updateTwoStepNonce,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE ]: updateTwoStepNonce,
	[ TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS ]: updateTwoStepNonce,
	[ TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST_FAILURE ]: updateTwoStepNonce,
	[ TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST_SUCCESS ]: ( state, action ) => (
		Object.assign( {}, updateTwoStepNonce( state, action ), { push_web_token: action.pushWebToken } )
	),
	[ TWO_FACTOR_AUTHENTICATION_PUSH_REQUEST_FAILURE ]: updateTwoStepNonce,
	[ LOGIN_REQUEST_FAILURE ]: () => null
} );

export const isRequestingTwoFactorAuth = createReducer( false, {
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST ]: () => true,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE ]: () => false,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS ]: () => false,
} );

export const twoFactorAuthRequestError = createReducer( null, {
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS ]: () => null,
	[ TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE ]: ( state, { error } ) => error
} );

export const twoFactorAuthPushPoll = createReducer( { isRequesting: false, inProgress: false, success: false }, {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_REQUEST ]: state => ( { ...state, isRequesting: true } ),
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: state => ( { ...state, inProgress: true, success: false } ),
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP ]: state => ( { ...state, inProgress: false } ),
	[ TWO_FACTOR_AUTHENTICATION_PUSH_REQUEST_SUCCESS ]: state => ( { ...state, isRequesting: false, inProgress: false, success: true } ),
	[ TWO_FACTOR_AUTHENTICATION_PUSH_REQUEST_FAILURE ]: state => ( { ...state, isRequesting: false } ),
} );

export const isRequestingSendPushNotification = createReducer( false, {
	[ TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST ]: () => true,
	[ TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST_FAILURE ]: () => false,
	[ TWO_FACTOR_AUTHENTICATION_SEND_PUSH_NOTIFICATION_REQUEST_SUCCESS ]: () => false,
} );

export default combineReducers( {
	isRequesting,
	isRequestingTwoFactorAuth,
	isRequestingSendPushNotification,
	magicLogin,
	requestError,
	requestNotice,
	requestSuccess,
	twoFactorAuth,
	twoFactorAuthRequestError,
	twoFactorAuthPushPoll,
} );
