/** @format */
/**
 * External dependencis
 */
import { includes, isEmpty, omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_COMPLETE_FLOW,
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_REDIRECT_WP_ADMIN,
	JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL,
	JETPACK_CONNECT_USER_ALREADY_CONNECTED,
	SITE_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { isStale } from '../utils';
import { JETPACK_CONNECT_AUTHORIZE_TTL } from '../constants';

export default function jetpackConnectAuthorize( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_AUTHORIZE:
			return Object.assign( {}, omit( state, 'userData', 'bearerToken' ), {
				isAuthorizing: true,
				authorizeSuccess: false,
				authorizeError: false,
				isRedirectingToWpAdmin: false,
				autoAuthorize: false,
			} );

		case JETPACK_CONNECT_AUTHORIZE_RECEIVE:
			if ( isEmpty( action.error ) && action.data ) {
				const { plans_url } = action.data;
				return Object.assign( {}, state, {
					authorizeError: false,
					authorizeSuccess: true,
					autoAuthorize: false,
					plansUrl: plans_url,
					siteReceived: false,
				} );
			}
			return Object.assign( {}, state, {
				isAuthorizing: false,
				authorizeError: action.error,
				authorizeSuccess: false,
				autoAuthorize: false,
			} );

		case JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE:
			return Object.assign( {}, state, { authorizationCode: action.data.code } );

		case JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST:
			const updateQueryObject = omit( state.queryObject, '_wp_nonce', 'secret', 'scope' );
			return Object.assign( {}, omit( state, 'queryObject' ), {
				siteReceived: true,
				isAuthorizing: false,
				queryObject: updateQueryObject,
			} );

		case JETPACK_CONNECT_QUERY_SET:
			const queryObject = Object.assign( {}, action.queryObject );
			const shouldAutoAuthorize = includes(
				[ 'woocommerce-services-auto-authorize', 'woocommerce-setup-wizard' ],
				queryObject.from
			);
			return Object.assign(
				{},
				{
					queryObject: {},
					isAuthorizing: false,
					authorizeSuccess: false,
					authorizeError: false,
					timestamp: Date.now(),
					userAlreadyConnected: false,
					autoAuthorize: false,
				},
				{ queryObject },
				shouldAutoAuthorize && { autoAuthorize: true }
			);

		case JETPACK_CONNECT_CREATE_ACCOUNT:
			return Object.assign( {}, state, {
				isAuthorizing: true,
				authorizeSuccess: false,
				authorizeError: false,
				autoAuthorize: true,
			} );

		case JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE:
			if ( ! isEmpty( action.error ) ) {
				return Object.assign( {}, state, {
					isAuthorizing: false,
					authorizeSuccess: false,
					authorizeError: true,
					autoAuthorize: false,
				} );
			}
			return Object.assign( {}, state, {
				isAuthorizing: true,
				authorizeSuccess: false,
				authorizeError: false,
				autoAuthorize: true,
				userData: action.userData,
				bearerToken: action.data.bearer_token,
			} );

		case SITE_REQUEST_FAILURE:
			if (
				state.queryObject &&
				state.queryObject.client_id &&
				parseInt( state.queryObject.client_id, 10 ) === action.siteId
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
