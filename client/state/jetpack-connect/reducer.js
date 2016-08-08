/**
 * External dependencis
 */
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import { combineReducers } from 'redux';
import urlModule from 'url';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_QUERY_UPDATE,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_ACTIVATE_MANAGE,
	JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_REDIRECT,
	JETPACK_CONNECT_REDIRECT_WP_ADMIN,
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

import { isValidStateWithSchema } from 'state/utils';
import { jetpackConnectSessionsSchema } from './schema';

const defaultAuthorizeState = {
	queryObject: {},
	isAuthorizing: false,
	authorizeSuccess: false,
	authorizeError: false
};

function buildNoProtocolUrlObj( url, flowType ) {
	const noProtocolUrl = url.replace( /.*?:\/\//g, '' );
	const sessionValue = {
		timestamp: Date.now(),
		flowType: flowType || ''
	};
	return { [ noProtocolUrl ]: sessionValue };
}

export function jetpackConnectSessions( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return Object.assign( {}, state, buildNoProtocolUrlObj( action.url, action.flowType ) );
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, jetpackConnectSessionsSchema ) ) {
				return state;
			}
			return {};
		case SERIALIZE:
			return state;
	}
	return state;
}

export function jetpackConnectSite( state = {}, action ) {
	const defaultState = {
		url: null,
		isFetching: false,
		isFetched: false,
		isDismissed: false,
		installConfirmedByUser: null,
		data: {}
	};
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return Object.assign(
				{},
				defaultState,
				{
					url: action.url,
					isFetching: true,
					isFetched: false,
					isDismissed: false,
					installConfirmedByUser: null,
					data: {}
				}
			);
		case JETPACK_CONNECT_CHECK_URL_RECEIVE:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { isFetching: false, isFetched: true, data: action.data } );
			}
			return state;
		case JETPACK_CONNECT_DISMISS_URL_STATUS:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { installConfirmedByUser: null, isDismissed: true } );
			}
			return state;
		case JETPACK_CONNECT_REDIRECT:
			if ( action.url === state.url ) {
				return Object.assign( {}, state, { isRedirecting: true } );
			}
			return state;
		case JETPACK_CONNECT_CONFIRM_JETPACK_STATUS:
			return Object.assign( {}, state, { installConfirmedByUser: action.status } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function jetpackConnectAuthorize( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_AUTHORIZE:
			return Object.assign(
				{},
				omit( state, 'userData', 'bearerToken' ),
				{
					isAuthorizing: true,
					authorizeSuccess: false,
					authorizeError: false,
					isRedirectingToWpAdmin: false,
					autoAuthorize: false
				}
			);
		case JETPACK_CONNECT_AUTHORIZE_RECEIVE:
			if ( isEmpty( action.error ) && action.data ) {
				const { plans_url, activate_manage } = action.data;
				return Object.assign(
					{},
					state,
					{
						authorizeError: false,
						authorizeSuccess: true,
						autoAuthorize: false,
						plansUrl: plans_url,
						siteReceived: false,
						activateManageSecret: activate_manage
					}
				);
			}
			return Object.assign(
				{},
				state,
				{
					isAuthorizing: false,
					authorizeError: action.error,
					authorizeSuccess: false,
					autoAuthorize: false
				}
			);
		case JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST:
			const updateQueryObject = omit( state.queryObject, '_wp_nonce', 'secret', 'scope' );
			return Object.assign(
				{},
				omit( state, 'queryObject' ),
				{
					siteReceived: true,
					isAuthorizing: false,
					queryObject: updateQueryObject
				}
			);
		case JETPACK_CONNECT_ACTIVATE_MANAGE:
			return Object.assign(
				{},
				state,
				{ isActivating: true }
			);
		case JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE:
			const error = action.error;
			return Object.assign(
				{},
				state,
				{
					isActivating: false,
					manageActivated: true,
					manageActivatedError: error,
					activateManageSecret: false
				}
			);
		case JETPACK_CONNECT_QUERY_SET:
			const queryObject = Object.assign( {}, action.queryObject );
			return Object.assign(
				{},
				defaultAuthorizeState,
				{ queryObject: queryObject }
			);
		case JETPACK_CONNECT_QUERY_UPDATE:
			return Object.assign(
				{},
				state,
				{
					queryObject: Object.assign( {}, state.queryObject, { [ action.property ]: action.value } )
				}
			);
		case JETPACK_CONNECT_CREATE_ACCOUNT:
			return Object.assign(
				{},
				state,
				{
					isAuthorizing: true,
					authorizeSuccess: false,
					authorizeError: false,
					autoAuthorize: true
				}
			);
		case JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE:
			if ( ! isEmpty( action.error ) ) {
				return Object.assign(
					{},
					state,
					{
						isAuthorizing: false,
						authorizeSuccess: false,
						authorizeError: true,
						autoAuthorize: false
					}
				);
			}
			return Object.assign(
				{},
				state,
				{
					isAuthorizing: true,
					authorizeSuccess: false,
					authorizeError: false,
					autoAuthorize: true,
					userData: action.userData,
					bearerToken: action.data.bearer_token
				}
			);
		case JETPACK_CONNECT_REDIRECT_WP_ADMIN:
			return Object.assign( {}, state, { isRedirectingToWpAdmin: true } );
		case DESERIALIZE:
			return state;
		case SERIALIZE:
			return state;
	}
	return state;
}

export function jetpackSSO( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_SSO_VALIDATION_REQUEST:
			return Object.assign( state, { isValidating: true } );
		case JETPACK_CONNECT_SSO_VALIDATION_SUCCESS:
			return Object. assign( state, {
				isValidating: false,
				validationError: false,
				nonceValid: action.success,
				blogDetails: action.blogDetails,
				sharedDetails: action.sharedDetails
			} );
		case JETPACK_CONNECT_SSO_VALIDATION_ERROR:
			return Object. assign( state, { isValidating: false, validationError: action.error, nonceValid: false } );
		case JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST:
			return Object.assign( state, { isAuthorizing: true } );
		case JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS:
			return Object. assign( state, { isAuthorizing: false, authorizationError: false, ssoUrl: action.ssoUrl } );
		case JETPACK_CONNECT_SSO_AUTHORIZE_ERROR:
			return Object. assign( state, { isAuthorizing: false, authorizationError: action.error, ssoUrl: false } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function jetpackSSOSessions( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS:
			return Object.assign( {}, state, buildNoProtocolUrlObj( action.siteUrl ) );
		case SERIALIZE:
		case DESERIALIZE:
			return state;
	}
	return state;
}

export default combineReducers( {
	jetpackConnectSite,
	jetpackSSOSessions,
	jetpackSSO,
	jetpackConnectAuthorize,
	jetpackConnectSessions,
} );
