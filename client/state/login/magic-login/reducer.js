/**
 * Internal dependencies
 */

import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
	REQUEST_FORM,
} from './constants';

import {
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_REQUEST_AUTH_ERROR,
	MAGIC_LOGIN_REQUEST_AUTH_FETCH,
	MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_RESET_REQUEST_FORM,
} from 'calypso/state/action-types';

export const currentView = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_HIDE_REQUEST_FORM:
			return null;
		case MAGIC_LOGIN_RESET_REQUEST_FORM:
			return REQUEST_FORM;
		case MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE:
			return CHECK_YOUR_EMAIL_PAGE;
		case MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE:
			return INTERSTITIAL_PAGE;
		case MAGIC_LOGIN_SHOW_LINK_EXPIRED:
			return LINK_EXPIRED_PAGE;
	}

	return state;
} );

export const isFetchingEmail = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_HIDE_REQUEST_FORM:
			return false;
		case MAGIC_LOGIN_HIDE_REQUEST_NOTICE:
			return false;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR:
			return false;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH:
			return true;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS:
			return false;
	}

	return state;
} );

export const isFetchingAuth = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_REQUEST_AUTH_ERROR:
			return false;
		case MAGIC_LOGIN_REQUEST_AUTH_FETCH:
			return true;
		case MAGIC_LOGIN_REQUEST_AUTH_SUCCESS:
			return false;
		case MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE:
			return false;
	}

	return state;
} );

export const requestAuthSuccess = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_REQUEST_AUTH_ERROR:
			return false;
		case MAGIC_LOGIN_REQUEST_AUTH_FETCH:
			return false;
		case MAGIC_LOGIN_REQUEST_AUTH_SUCCESS:
			return true;
	}

	return state;
} );

export const requestAuthError = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_REQUEST_AUTH_ERROR: {
			const { error } = action;
			return error;
		}
		case MAGIC_LOGIN_REQUEST_AUTH_FETCH:
			return null;
		case MAGIC_LOGIN_REQUEST_AUTH_SUCCESS:
			return null;
	}

	return state;
} );

export const requestEmailError = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_HIDE_REQUEST_NOTICE:
			return null;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR: {
			const { error } = action;
			return error;
		}
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH:
			return null;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS:
			return null;
		case MAGIC_LOGIN_RESET_REQUEST_FORM:
			return null;
	}

	return state;
} );

export const requestEmailSuccess = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_HIDE_REQUEST_NOTICE:
			return false;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR:
			return false;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH:
			return false;
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS:
			return true;
		case MAGIC_LOGIN_RESET_REQUEST_FORM:
			return false;
	}

	return state;
} );

export default combineReducers( {
	isFetchingAuth,
	isFetchingEmail,
	requestAuthError,
	requestAuthSuccess,
	requestEmailError,
	requestEmailSuccess,
	currentView,
} );
