/**
 * External dependencies
 */
import { keyBy, omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_RECEIVE,
	PUBLICIZE_CONNECTION_REQUEST,
	PUBLICIZE_CONNECTION_REQUEST_FAILURE,
	PUBLICIZE_CONNECTION_REQUEST_SUCCESS,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
	PUBLICIZE_SHARE,
	PUBLICIZE_SHARE_SUCCESS,
	PUBLICIZE_SHARE_FAILURE,
	PUBLICIZE_SHARE_DISMISS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { connectionsSchema } from './schema';
import sharePostActions from './publicize-actions/reducer';

export const sharePostStatus = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_SHARE: {
			const { siteId, postId } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						requesting: true,
					},
				},
			};
		}
		case PUBLICIZE_SHARE_SUCCESS: {
			const { siteId, postId } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						requesting: false,
						success: true,
					},
				},
			};
		}
		case PUBLICIZE_SHARE_FAILURE: {
			const { siteId, postId, error } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						requesting: false,
						success: false,
						error,
					},
				},
			};
		}
		case PUBLICIZE_SHARE_DISMISS: {
			const { siteId, postId } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: undefined,
				},
			};
		}
	}

	return state;
} );

export const fetchingConnection = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_CONNECTION_REQUEST: {
			const { connectionId } = action;

			return {
				...state,
				[ connectionId ]: true,
			};
		}
		case PUBLICIZE_CONNECTION_REQUEST_SUCCESS: {
			const { connectionId } = action;

			return {
				...state,
				[ connectionId ]: false,
			};
		}
		case PUBLICIZE_CONNECTION_REQUEST_FAILURE: {
			const { connectionId } = action;

			return {
				...state,
				[ connectionId ]: false,
			};
		}
	}

	return state;
} );

/**
 * Track the current status for fetching connections. Maps site ID to the
 * fetching status for that site. Assigns `true` for currently fetching,
 * `false` for done or failed fetching, or `undefined` if no fetch attempt
 * has been made for the site.
 */
export const fetchingConnections = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_CONNECTIONS_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case PUBLICIZE_CONNECTIONS_RECEIVE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case PUBLICIZE_CONNECTIONS_REQUEST_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
} );

export const fetchedConnections = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_CONNECTIONS_RECEIVE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
	}

	return state;
} );

// Tracks all known connection objects, indexed by connection ID.
export const connections = withSchemaValidation( connectionsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_CONNECTIONS_RECEIVE:
			return {
				...omitBy( state, { site_ID: action.siteId } ),
				...keyBy( action.data.connections, 'ID' ),
			};
		case PUBLICIZE_CONNECTION_CREATE: {
			const { connection } = action;

			return {
				...state,
				[ connection.ID ]: connection,
			};
		}
		case PUBLICIZE_CONNECTION_DELETE: {
			const {
				connection: { ID },
			} = action;
			return omit( state, ID );
		}
		case PUBLICIZE_CONNECTION_RECEIVE: {
			const { connection } = action;

			return {
				...state,
				[ connection.ID ]: connection,
			};
		}
		case PUBLICIZE_CONNECTION_UPDATE: {
			const { connection } = action;

			return {
				...state,
				[ connection.ID ]: connection,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	fetchingConnection,
	fetchingConnections,
	fetchedConnections,
	connections,
	sharePostStatus,
	sharePostActions,
} );
