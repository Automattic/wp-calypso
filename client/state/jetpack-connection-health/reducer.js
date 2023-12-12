import { withStorageKey } from '@automattic/state-utils';
import {
	JETPACK_CONNECTION_HEALTHY,
	JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	JETPACK_CONNECTION_UNHEALTHY,
	JETPACK_CONNECTION_HEALTH_REQUEST,
	JETPACK_CONNECTION_HEALTH_REQUEST_SUCCESS,
	JETPACK_CONNECTION_HEALTH_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import {
	combineReducers,
	withSchemaValidation,
	keyedReducer,
	withPersistence,
} from 'calypso/state/utils';
import { schema } from './schema';

export const connectionHealth = withPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_CONNECTION_HEALTHY: {
			return {
				...state,
				jetpack_connection_problem: false,
				is_healthy: true,
				error: '',
			};
		}

		case JETPACK_CONNECTION_MAYBE_UNHEALTHY: {
			return {
				...state,
				jetpack_connection_problem: true,
			};
		}

		case JETPACK_CONNECTION_UNHEALTHY: {
			const { errorCode } = action;

			return {
				...state,
				jetpack_connection_problem: true,
				is_healthy: false,
				error: errorCode,
			};
		}
	}

	return state;
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection requests
 * @param {Object} state - current state
 * @param {Object} action - action
 * @returns {Object} updated state
 */
export const requestError = withPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case JETPACK_CONNECTION_HEALTH_REQUEST:
			return '';
		case JETPACK_CONNECTION_HEALTH_REQUEST_FAILURE:
			return action.error;
		default:
			return state;
	}
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection requests
 * @param {Object} state - current state
 * @param {Object} action - action
 * @returns {Object} updated state
 */
export const lastRequestTime = withPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case JETPACK_CONNECTION_HEALTH_REQUEST:
			return action.lastRequestTime;
		default:
			return state;
	}
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection requests
 * @param {Object} state - current state
 * @param {Object} action - action
 * @returns {Object} updated state
 */
export const isLoading = withPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case JETPACK_CONNECTION_HEALTH_REQUEST:
			return true;
		case JETPACK_CONNECTION_HEALTH_REQUEST_FAILURE:
		case JETPACK_CONNECTION_HEALTH_REQUEST_SUCCESS:
			return false;
		default:
			return state;
	}
} );

export const reducer = combineReducers( {
	requestError,
	isLoading,
	connectionHealth,
	lastRequestTime,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
const validatedReducer = withSchemaValidation( schema, keyedReducer( 'siteId', reducer ) );

export default withStorageKey( 'jetpackConnectionHealth', validatedReducer );
