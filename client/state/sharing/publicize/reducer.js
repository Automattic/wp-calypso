/**
 * External dependencies
 */
import { combineReducers } from 'redux';
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
	PUBLICIZE_SHARE_DISMISS
} from 'state/action-types';
import { connectionsSchema } from './schema';
import { createReducer } from 'state/utils';
import sharePostActions from './publicize-actions/reducer';

export const sharePostStatus = createReducer( {}, {
	[ PUBLICIZE_SHARE ]: ( state, { siteId, postId } ) => ( { ...state, [ siteId ]: { ...state[ siteId ], [ postId ]: {
		requesting: true,
	} } } ),
	[ PUBLICIZE_SHARE_SUCCESS ]: ( state, { siteId, postId } ) => ( { ...state, [ siteId ]: { ...state[ siteId ], [ postId ]: {
		requesting: false,
		success: true,
	} } } ),
	[ PUBLICIZE_SHARE_FAILURE ]: ( state, { siteId, postId, error } ) => ( { ...state, [ siteId ]: { ...state[ siteId ], [ postId ]: {
		requesting: false,
		success: false,
		error,
	} } } ),
	[ PUBLICIZE_SHARE_DISMISS ]: ( state, { siteId, postId } ) => ( { ...state, [ siteId ]: {
		...state[ siteId ], [ postId ]: undefined
	} } ),
} );

export const fetchingConnection = createReducer( {}, {
	[ PUBLICIZE_CONNECTION_REQUEST ]: ( state, { connectionId } ) => ( { ...state, [ connectionId ]: true } ),
	[ PUBLICIZE_CONNECTION_REQUEST_SUCCESS ]: ( state, { connectionId } ) => ( { ...state, [ connectionId ]: false } ),
	[ PUBLICIZE_CONNECTION_REQUEST_FAILURE ]: ( state, { connectionId } ) => ( { ...state, [ connectionId ]: false } ),
} );

/**
 * Track the current status for fetching connections. Maps site ID to the
 * fetching status for that site. Assigns `true` for currently fetching,
 * `false` for done or failed fetching, or `undefined` if no fetch attempt
 * has been made for the site.
 */
export const fetchingConnections = createReducer( {}, {
	[ PUBLICIZE_CONNECTIONS_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ PUBLICIZE_CONNECTIONS_RECEIVE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ PUBLICIZE_CONNECTIONS_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

export const fetchedConnections = createReducer( {}, {
	[ PUBLICIZE_CONNECTIONS_RECEIVE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
} );

// Tracks all known connection objects, indexed by connection ID.
export const connections = createReducer( {}, {
	[ PUBLICIZE_CONNECTIONS_RECEIVE ]: ( state, action ) => ( {
		...omitBy( state, { site_ID: action.siteId } ),
		...keyBy( action.data.connections, 'ID' )
	} ),
	[ PUBLICIZE_CONNECTION_CREATE ]: ( state, { connection } ) => ( { ...state, [ connection.ID ]: connection } ),
	[ PUBLICIZE_CONNECTION_DELETE ]: ( state, { connection: { ID } } ) => omit( state, ID ),
	[ PUBLICIZE_CONNECTION_RECEIVE ]: ( state, { connection } ) => ( { ...state, [ connection.ID ]: connection } ),
	[ PUBLICIZE_CONNECTION_UPDATE ]: ( state, { connection } ) => ( { ...state, [ connection.ID ]: connection } ),
}, connectionsSchema );

export default combineReducers( {
	fetchingConnection,
	fetchingConnections,
	fetchedConnections,
	connections,
	sharePostStatus,
	sharePostActions,
} );
