/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
	REQUEST_FORM,
} from './constants';

import {
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_SHOW_REQUEST_FORM,
	MAGIC_LOGIN_REQUEST_AUTH_ERROR,
	MAGIC_LOGIN_REQUEST_AUTH_FETCH,
	MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
} from 'state/action-types';

export const currentView = createReducer( null, {
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => null,
	[ MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE ]: () => CHECK_YOUR_EMAIL_PAGE,
	[ MAGIC_LOGIN_SHOW_REQUEST_FORM ]: () => REQUEST_FORM,
	[ MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE ]: () => INTERSTITIAL_PAGE,
	[ MAGIC_LOGIN_SHOW_LINK_EXPIRED ]: () => LINK_EXPIRED_PAGE,
} );

export const isFetchingEmail = createReducer( false, {
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH ]: () => true,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS ]: () => false,
} );

export const isFetchingAuth = createReducer( false, {
	[ MAGIC_LOGIN_REQUEST_AUTH_ERROR ]: () => false,
	[ MAGIC_LOGIN_REQUEST_AUTH_FETCH ]: () => true,
	[ MAGIC_LOGIN_REQUEST_AUTH_SUCCESS ]: () => false,
	[ MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE ]: () => false,
} );

export const emailAddressFormInput = createReducer( '', {
	[ MAGIC_LOGIN_HIDE_REQUEST_FORM ]: () => '',
	[ MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS ]: ( state, { email } ) => email,
} );

export const requestAuthSuccess = createReducer( false, {
	[ MAGIC_LOGIN_REQUEST_AUTH_ERROR ]: () => false,
	[ MAGIC_LOGIN_REQUEST_AUTH_FETCH ]: () => false,
	[ MAGIC_LOGIN_REQUEST_AUTH_SUCCESS ]: () => true,
	[ MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS ]: () => false,
} );

export const requestAuthError = createReducer( null, {
	[ MAGIC_LOGIN_REQUEST_AUTH_ERROR ]: ( state, { error } ) => error,
	[ MAGIC_LOGIN_REQUEST_AUTH_FETCH ]: () => null,
	[ MAGIC_LOGIN_REQUEST_AUTH_SUCCESS ]: () => null,
} );

export const requestEmailError = createReducer( null, {
	[ MAGIC_LOGIN_SHOW_REQUEST_FORM ]: () => null,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => null,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR ]: ( state, { error } ) => error,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH ]: () => null,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS ]: () => null,
	[ MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS ]: () => null,
} );

export const requestEmailSuccess = createReducer( false, {
	[ MAGIC_LOGIN_SHOW_REQUEST_FORM ]: () => false,
	[ MAGIC_LOGIN_HIDE_REQUEST_NOTICE ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH ]: () => false,
	[ MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS ]: () => true,
} );

export default combineReducers( {
	emailAddressFormInput,
	isFetchingEmail,
	requestAuthError,
	requestAuthSuccess,
	requestEmailError,
	requestEmailSuccess,
	currentView,
} );
