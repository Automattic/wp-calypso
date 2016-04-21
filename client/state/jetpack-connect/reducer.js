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
	JETPACK_CONNECT_STORE_SESSION,
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
			var newstate = Object.assign( {}, state, { [ action.url ]:  ( new Date() ).getTime() } );
			console.log(newstate);
			return newstate;
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
			return Object.assign( {}, state, { isAuthorizing: true, authorizeSuccess: false, authorizeError: false } );
		case JETPACK_CONNECT_AUTHORIZE_RECEIVE:
			if ( ! action.error ) {
				const { plans_url } = action.data;
				return Object.assign( {}, state, { authorizeError: false, authorizeSuccess: true, autoAuthorize: false, plansURL: plans_url, siteReceived: false } );
			}
			return Object.assign( {}, state, { isAuthorizing: false, authorizeError: action.error, authorizeSuccess: false, autoAuthorize: false } );
		case JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST:
			return Object.assign( {}, state, { siteReceived: true, isAuthorizing: false } );
		case JETPACK_CONNECT_QUERY_SET:
			const queryObject = Object.assign( {}, action.queryObject );
			return Object.assign( {}, defaultAuthorizeState, { queryObject: queryObject } );
		case JETPACK_CONNECT_QUERY_UPDATE:
			return Object.assign( {}, state, { queryObject: Object.assign( {}, state.queryObject, { [ action.property ]: action.value } ) } );
		case JETPACK_CONNECT_CREATE_ACCOUNT:
			return Object.assign( {}, state, { isAuthorizing: true, authorizeSuccess: false, authorizeError: false, autoAuthorize: true } );
		case JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE:
			if ( action.error ) {
				return Object.assign( {}, state, { isAuthorizing: false, authorizeSuccess: false, authorizeError: true, autoAuthorize: false } );
			}
			return Object.assign( {}, state, { isAuthorizing: true, authorizeSuccess: false, authorizeError: false, autoAuthorize: true, userData: action.userData, bearerToken: action.data.bearer_token } );
		case SERIALIZE:
		case DESERIALIZE:
			return state;
	}
	return state;
}

export default combineReducers( {
	jetpackConnectSite,
	jetpackConnectAuthorize,
	jetpackConnectSessions,
} );
