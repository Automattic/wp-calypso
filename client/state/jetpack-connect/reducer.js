/**
 * External dependencis
 */
 import isEmpty from 'lodash/isEmpty';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_QUERY_UPDATE,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_REDIRECT,
	JETPACK_CONNECT_REDIRECT_WP_ADMIN,
	JETPACK_CONNECT_STORE_SESSION,
	JETPACK_CONNECT_SSO_QUERY_SET,
	JETPACK_CONNECT_SSO_VALIDATE,
	JETPACK_CONNECT_SSO_AUTHORIZE,
	JETPACK_CONNECT_SSO_VALIDATION_RECEIVE,
	JETPACK_CONNECT_SSO_AUTHORIZATION_RECEIVE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { combineReducers } from 'redux';

const defaultAuthorizeState = {
	queryObject: {},
	isAuthorizing: false,
	authorizeSuccess: false,
	authorizeError: false
};

export function jetpackConnectSessions( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_STORE_SESSION:
			const noProtocolUrl = action.url.replace( /.*?:\/\//g, '' );
			return Object.assign( {}, state, { [ noProtocolUrl ]: ( new Date() ).getTime() } );
		case SERIALIZE:
		case DESERIALIZE:
			return state;
	}
	return state;
}

export function jetpackConnectSite( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return Object.assign( {}, { url: action.url, isFetching: true, isFetched: false, isDismissed: false, data: {} } );
		case JETPACK_CONNECT_CHECK_URL_RECEIVE:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { isFetching: false, isFetched: true, data: action.data } );
			}
			return state;
		case JETPACK_CONNECT_DISMISS_URL_STATUS:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { isDismissed: true } );
			}
			return state;
		case JETPACK_CONNECT_REDIRECT:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { isRedirecting: true } );
			}
			return state;
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function jetpackConnectAuthorize( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_AUTHORIZE:
			return Object.assign( {}, state, { isAuthorizing: true, authorizeSuccess: false, authorizeError: false, isRedirectingToWpAdmin: false } );
		case JETPACK_CONNECT_AUTHORIZE_RECEIVE:
			if ( isEmpty( action.error ) && action.data ) {
				const { plans_url } = action.data;
				return Object.assign( {}, state, { authorizeError: false, authorizeSuccess: true, autoAuthorize: false, plansURL: plans_url, siteReceived: false } );
			}
			return Object.assign( {}, state, { isAuthorizing: false, authorizeError: action.error, authorizeSuccess: false, autoAuthorize: false } );
		case JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST:
			return Object.assign( {}, state, { siteReceived: true, isAuthorizing: false } );
		case JETPACK_CONNECT_QUERY_SET:
			const queryObject = Object.assign( {}, action.queryObject );
			return Object.assign( {}, state, defaultAuthorizeState, { queryObject: queryObject } );
		case JETPACK_CONNECT_QUERY_UPDATE:
			return Object.assign( {}, state, { queryObject: Object.assign( {}, state.queryObject, { [ action.property ]: action.value } ) } );
		case JETPACK_CONNECT_CREATE_ACCOUNT:
			return Object.assign( {}, state, { isAuthorizing: true, authorizeSuccess: false, authorizeError: false, autoAuthorize: true } );
		case JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE:
			if ( ! isEmpty( action.error ) ) {
				return Object.assign( {}, state, { isAuthorizing: false, authorizeSuccess: false, authorizeError: true, autoAuthorize: false } );
			}
			return Object.assign( {}, state, { isAuthorizing: true, authorizeSuccess: false, authorizeError: false, autoAuthorize: true, userData: action.userData, bearerToken: action.data.bearer_token } );
		case JETPACK_CONNECT_REDIRECT_WP_ADMIN:
			return Object.assign( {}, state, { isRedirectingToWpAdmin: true } );
		case JETPACK_CONNECT_SSO_AUTHORIZE:
			return Object.assign( {}, defaultAuthorizeState, { autoAuthorize: true } );
		case JETPACK_CONNECT_SSO_AUTHORIZATION_RECEIVE:
			if ( action.error ) {
				return Object.assign( state, { autoAuthorize: false } );
			}
		case SERIALIZE:
		case DESERIALIZE:
			return Object.assign( {}, state, { isRedirectingToWpAdmin: false } );
	}
	return state;
}

export function jetpackSSO( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_SSO_QUERY_SET:
			const queryObject = Object.assign( {}, action.queryObject );
			return Object.assign( {}, queryObject );
		case JETPACK_CONNECT_SSO_VALIDATE:
			return Object.assign( state, { isValidating: true } );
		case JETPACK_CONNECT_SSO_AUTHORIZE:
			return Object.assign( state, { isAuthorizing: true } );
		case JETPACK_CONNECT_SSO_VALIDATION_RECEIVE:
			if ( action.error ) {
				return Object. assign( state, { isValidating: false, site_id: action.siteId, validationError: action.error, nonceValid: false } );
			}

			return Object. assign( state, { isValidating: false, site_id: action.siteId, validationError: false, nonceValid: action.data.success } );
		case JETPACK_CONNECT_SSO_AUTHORIZATION_RECEIVE:
			if ( action.error ) {
				return Object. assign( state, { isAuthorizing: false, site_id: action.siteId, authorizationError: action.error, ssoUrl: false } );
			}

			return Object. assign( state, { isAuthorizing: false, site_id: action.siteId, authorizationError: false, ssoUrl: action.data.sso_url } );
		case SERIALIZE:
		case SERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	jetpackConnectSite,
	jetpackConnectAuthorize,
	jetpackConnectSessions,
	jetpackSSO,
} );
