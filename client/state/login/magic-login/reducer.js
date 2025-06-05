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
import { combineReducers } from 'calypso/state/utils';
import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
	REQUEST_FORM,
} from './constants';

export const currentView = ( state = null, action ) => {
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
};

export const isFetchingEmail = ( state = false, action ) => {
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
};

export const isFetchingAuth = ( state = false, action ) => {
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
};

export const requestAuthSuccess = ( state = false, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_REQUEST_AUTH_ERROR:
			return false;
		case MAGIC_LOGIN_REQUEST_AUTH_FETCH:
			return false;
		case MAGIC_LOGIN_REQUEST_AUTH_SUCCESS:
			return true;
	}

	return state;
};

export const requestAuthError = ( state = null, action ) => {
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
};

export const requestEmailError = ( state = null, action ) => {
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
};

export const requestEmailSuccess = ( state = false, action ) => {
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
};

export const publicToken = ( state = null, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS:
			return action.response?.public_token || null;
		case MAGIC_LOGIN_RESET_REQUEST_FORM:
			return null;
	}

	return state;
};

export const authSuccessData = ( state = null, action ) => {
	switch ( action.type ) {
		case MAGIC_LOGIN_REQUEST_AUTH_SUCCESS:
			return action.data || null;
		case MAGIC_LOGIN_REQUEST_AUTH_ERROR:
		case MAGIC_LOGIN_REQUEST_AUTH_FETCH:
		case MAGIC_LOGIN_RESET_REQUEST_FORM:
			return null;
	}

	return state;
};

export default combineReducers( {
	isFetchingAuth,
	isFetchingEmail,
	requestAuthError,
	requestAuthSuccess,
	requestEmailError,
	requestEmailSuccess,
	currentView,
	publicToken,
	authSuccessData,
} );
