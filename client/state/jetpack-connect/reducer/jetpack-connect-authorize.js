/** @format */
/**
 * External dependencis
 */
import { get, isEmpty, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { isStale } from '../utils';
import { isValidStateWithSchema } from 'state/utils';
import { JETPACK_CONNECT_AUTHORIZE_TTL } from '../constants';
import { jetpackConnectAuthorizeSchema } from './schema';
import {
	DESERIALIZE,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_COMPLETE_FLOW,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_USER_ALREADY_CONNECTED,
	SERIALIZE,
	SITE_REQUEST_FAILURE,
} from 'state/action-types';

export default function jetpackConnectAuthorize( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_AUTHORIZE:
			return Object.assign( omit( state, 'userData', 'bearerToken' ), {
				isAuthorizing: true,
				authorizeSuccess: false,
				authorizeError: false,
			} );

		case JETPACK_CONNECT_AUTHORIZE_RECEIVE:
			if ( isEmpty( action.error ) && action.data ) {
				const { plans_url } = action.data;
				return Object.assign( {}, state, {
					authorizeError: false,
					authorizeSuccess: true,
					plansUrl: plans_url,
					siteReceived: false,
				} );
			}
			return Object.assign( {}, state, {
				isAuthorizing: false,
				authorizeError: action.error,
				authorizeSuccess: false,
			} );

		case JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE:
			return Object.assign( {}, state, { authorizationCode: action.data.code } );

		case JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST:
			return Object.assign( {}, state, {
				siteReceived: true,
				isAuthorizing: false,
			} );

		case JETPACK_CONNECT_QUERY_SET:
			return {
				authorizeError: false,
				authorizeSuccess: false,
				clientId: action.clientId,
				isAuthorizing: false,
				timestamp: action.timestamp,
				userAlreadyConnected: false,
			};

		case JETPACK_CONNECT_CREATE_ACCOUNT:
			return Object.assign( {}, state, {
				isAuthorizing: true,
				authorizeSuccess: false,
				authorizeError: false,
			} );

		case JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE:
			if ( ! isEmpty( action.error ) ) {
				return Object.assign( {}, state, {
					isAuthorizing: false,
					authorizeSuccess: false,
					authorizeError: true,
				} );
			}
			return Object.assign( {}, state, {
				isAuthorizing: true,
				authorizeSuccess: false,
				authorizeError: false,
				userData: action.userData,
				bearerToken: get( action, [ 'data', 'bearer_token' ] ),
			} );

		case SITE_REQUEST_FAILURE:
			if ( state.clientId === action.siteId ) {
				return Object.assign( {}, state, { clientNotResponding: true } );
			}
			return state;

		case JETPACK_CONNECT_USER_ALREADY_CONNECTED:
			return Object.assign( {}, state, { userAlreadyConnected: true } );

		case JETPACK_CONNECT_COMPLETE_FLOW:
			return {};

		case DESERIALIZE:
			return isValidStateWithSchema( state, jetpackConnectAuthorizeSchema ) &&
				! isStale( state.timestamp, JETPACK_CONNECT_AUTHORIZE_TTL )
				? state
				: {};

		case SERIALIZE:
			return state;
	}

	return state;
}

jetpackConnectAuthorize.hasCustomPersistence = true;
