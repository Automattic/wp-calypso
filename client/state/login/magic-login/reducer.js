/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	DESERIALIZE,
	MAGIC_LOGIN_HANDLE_AUTH_TOKEN_FETCH,
	MAGIC_LOGIN_HANDLE_AUTH_TOKEN_RECEIVE,
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_SHOW_REQUEST_FORM,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	SERIALIZE,
} from 'state/action-types';

export const isShowingRequestForm = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE ]: () => false,
	[ MAGIC_LOGIN_SHOW_REQUEST_FORM ]: () => true,
	[ MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE ]: () => false,
	[ MAGIC_LOGIN_SHOW_LINK_EXPIRED ]: () => false,
} );

export const isShowingInterstitialPage = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => false,
	[ MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE ]: () => false,
	[ MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE ]: () => true,
	[ MAGIC_LOGIN_SHOW_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_SHOW_LINK_EXPIRED ]: () => false,
} );

export const isShowingExpiredPage = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => false,
	[ MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE ]: () => false,
	[ MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE ]: () => false,
	[ MAGIC_LOGIN_SHOW_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_SHOW_LINK_EXPIRED ]: () => true,
} );

export const isShowingCheckYourEmailPage = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => false,
	[ MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE ]: () => true,
	[ MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE ]: () => false,
	[ MAGIC_LOGIN_SHOW_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_SHOW_LINK_EXPIRED ]: () => false,
} );

export const isFetchingEmail = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH ]: () => true,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS ]: () => false,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_FETCH ]: () => false,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_RECEIVE ]: () => false,
} );

export const isFetchingAuth = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_FETCH ]: () => true,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_RECEIVE ]: () => false,
} );

export const emailAddressFormInput = createReducer( '', {
	[ DESERIALIZE ]: () => '',
	[ SERIALIZE ]: () => '',
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => '',
	[ MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS ]: ( state, { email } ) => email,
} );

export const emailAddressFormInputIsValid = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS ]: ( state, { email } ) => {
		return (
			typeof email === 'string' &&
			emailValidator.validate( email )
		);
	},
} );

export const requestEmailError = createReducer( null, {
	[ DESERIALIZE ]: () => null,
	[ SERIALIZE ]: () => null,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => null,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => null,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR ]: ( state, { error } ) => error,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH ]: () => null,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS ]: () => null,
	[ MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS ]: () => null,
} );

export const requestedEmailSuccessfully = createReducer( false, {
	[ DESERIALIZE ]: () => false,
	[ SERIALIZE ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS ]: () => true,
} );

export const requestAuthError = createReducer( null, {
	[ DESERIALIZE ]: () => null,
	[ SERIALIZE ]: () => null,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_FETCH ]: () => null,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_RECEIVE ]: ( state, { error } ) => error,
} );

export const requestAuthSuccess = createReducer( null, {
	[ DESERIALIZE ]: () => null,
	[ SERIALIZE ]: () => null,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_FETCH ]: () => null,
	[ MAGIC_LOGIN_HANDLE_AUTH_TOKEN_RECEIVE ]: ( state, { status } ) => status
} );

export default combineReducers( {
	emailAddressFormInput,
	emailAddressFormInputIsValid,
	isFetchingEmail,
	isShowingCheckYourEmailPage,
	isShowingExpiredPage,
	isShowingInterstitialPage,
	isShowingRequestForm,
	requestAuthError,
	requestAuthSuccess,
	requestEmailError,
	requestedEmailSuccessfully,
} );
