/**
 * External dependencies
 */
import { isEmpty, omit, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_AUTHORIZE_TTL, AUTH_ATTEMPS_TTL } from './constants';
import { jetpackConnectSessionsSchema, jetpackAuthAttemptsSchema, jetpackConnectSelectedPlansSchema } from './schema';
import { isStale } from './utils';
import { urlToSlug } from 'lib/url';
import { JETPACK_CONNECT_CHECK_URL, JETPACK_CONNECT_CHECK_URL_RECEIVE, JETPACK_CONNECT_DISMISS_URL_STATUS, JETPACK_CONNECT_CONFIRM_JETPACK_STATUS, JETPACK_CONNECT_COMPLETE_FLOW, JETPACK_CONNECT_QUERY_SET, JETPACK_CONNECT_AUTHORIZE, JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE, JETPACK_CONNECT_AUTHORIZE_RECEIVE, JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST, JETPACK_CONNECT_CREATE_ACCOUNT, JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE, JETPACK_CONNECT_REDIRECT, JETPACK_CONNECT_REDIRECT_WP_ADMIN, JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL, JETPACK_CONNECT_RETRY_AUTH, JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE, JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST, JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS, JETPACK_CONNECT_SSO_AUTHORIZE_ERROR, JETPACK_CONNECT_SSO_VALIDATION_REQUEST, JETPACK_CONNECT_SSO_VALIDATION_SUCCESS, JETPACK_CONNECT_SSO_VALIDATION_ERROR, JETPACK_CONNECT_USER_ALREADY_CONNECTED, SITE_REQUEST_FAILURE, SERIALIZE, DESERIALIZE } from 'state/action-types';
import { combineReducers, isValidStateWithSchema } from 'state/utils';

function buildDefaultAuthorizeState() {
	return {
		queryObject: {},
		isAuthorizing: false,
		authorizeSuccess: false,
		authorizeError: false,
		timestamp: Date.now(),
		userAlreadyConnected: false
	};
}

function buildUrlSessionObj( url, flowType ) {
	const slug = urlToSlug( url );
	const sessionValue = {
		timestamp: Date.now(),
		flowType: flowType || ''
	};
	return { [ slug ]: sessionValue };
}

export function jetpackConnectSessions( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return Object.assign( {}, state, buildUrlSessionObj( action.url, action.flowType ) );
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, jetpackConnectSessionsSchema ) ) {
				return pickBy( state, ( session ) => {
					return ! isStale( session.timestamp );
				} );
			}
			return {};
		case SERIALIZE:
			return state;
	}
	return state;
}
jetpackConnectSessions.hasCustomPersistence = true;

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
		case JETPACK_CONNECT_COMPLETE_FLOW:
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
				const { plans_url } = action.data;
				return Object.assign(
					{},
					state,
					{
						authorizeError: false,
						authorizeSuccess: true,
						autoAuthorize: false,
						plansUrl: plans_url,
						siteReceived: false
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
		case JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE:
			return Object.assign( {}, state, { authorizationCode: action.data.code } );
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
		case JETPACK_CONNECT_QUERY_SET:
			const queryObject = Object.assign( {}, action.queryObject );
			return Object.assign(
				{},
				buildDefaultAuthorizeState(),
				{ queryObject: queryObject }
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
		case SITE_REQUEST_FAILURE:
			if (
				state.queryObject &&
				state.queryObject.client_id &&
				parseInt( state.queryObject.client_id ) === action.siteId
			) {
				return Object.assign( {}, state, { clientNotResponding: true } );
			}
			return state;
		case JETPACK_CONNECT_USER_ALREADY_CONNECTED:
			return Object.assign( {}, state, { userAlreadyConnected: true } );
		case JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL:
			return Object.assign( {}, state, { isRedirectingToWpAdmin: true } );
		case JETPACK_CONNECT_REDIRECT_WP_ADMIN:
			return Object.assign( {}, state, { isRedirectingToWpAdmin: true } );
		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};
		case DESERIALIZE:
			return ! isStale( state.timestamp, JETPACK_CONNECT_AUTHORIZE_TTL ) ? state : {};
		case SERIALIZE:
			return state;
	}
	return state;
}
jetpackConnectAuthorize.hasCustomPersistence = true;

export function jetpackAuthAttempts( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_RETRY_AUTH:
			const slug = action.slug;
			let currentTimestamp = state[ slug ] ? state[ slug ].timestamp || Date.now() : Date.now();
			let attemptNumber = action.attemptNumber;
			if ( attemptNumber > 0 ) {
				const now = Date.now();
				if ( isStale( currentTimestamp, AUTH_ATTEMPS_TTL ) ) {
					currentTimestamp = now;
					attemptNumber = 0;
				}
			}
			return Object.assign( {}, state, { [ slug ]: { attempt: attemptNumber, timestamp: currentTimestamp } } );
		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};
	}
	return state;
}
jetpackAuthAttempts.schema = jetpackAuthAttemptsSchema;

export function jetpackSSO( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_SSO_VALIDATION_REQUEST:
			return Object.assign( {}, state, { isValidating: true } );
		case JETPACK_CONNECT_SSO_VALIDATION_SUCCESS:
			return Object. assign( {}, state, {
				isValidating: false,
				validationError: false,
				nonceValid: action.success,
				blogDetails: action.blogDetails,
				sharedDetails: action.sharedDetails
			} );
		case JETPACK_CONNECT_SSO_VALIDATION_ERROR:
			return Object.assign( {}, state, { isValidating: false, validationError: action.error, nonceValid: false } );
		case JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST:
			return Object.assign( {}, state, { isAuthorizing: true } );
		case JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS:
			return Object.assign( {}, state, { isAuthorizing: false, authorizationError: false, ssoUrl: action.ssoUrl } );
		case JETPACK_CONNECT_SSO_AUTHORIZE_ERROR:
			return Object.assign( {}, state, { isAuthorizing: false, authorizationError: action.error, ssoUrl: false } );
	}
	return state;
}

export function jetpackConnectSelectedPlans( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_SELECT_PLAN_IN_ADVANCE:
			const siteSlug = urlToSlug( action.site );
			return Object.assign( {}, state, { [ siteSlug ]: action.plan } );
		case JETPACK_CONNECT_CHECK_URL:
			return { '*': state[ '*' ] };
		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};
	}
	return state;
}
jetpackConnectSelectedPlans.schema = jetpackConnectSelectedPlansSchema;

export default combineReducers( {
	jetpackConnectSite,
	jetpackSSO,
	jetpackConnectAuthorize,
	jetpackConnectSessions,
	jetpackConnectSelectedPlans,
	jetpackAuthAttempts,
} );
