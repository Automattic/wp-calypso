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

/**
 * Track the current status for fetching connections. Maps site ID to the
 * fetching status for that site. Assigns `true` for currently fetching,
 * `false` for done or failed fetching, or `undefined` if no fetch attempt
 * has been made for the site.
 */
export const fetchingConnections = createReducer( {}, {
	[ PUBLICIZE_CONNECTIONS_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ PUBLICIZE_CONNECTIONS_RECEIVE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ PUBLICIZE_CONNECTIONS_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

// Tracks all known connection objects, indexed by connection ID.
export const connections = createReducer( {}, {
	[ PUBLICIZE_CONNECTIONS_RECEIVE ]: ( state, action ) => ( {
		...omitBy( state, { site_ID: action.siteId } ),
		...keyBy( action.data.connections, 'ID' )
	} ),
	[ PUBLICIZE_CONNECTION_CREATE ]: ( state, { connection } ) => ( { ...state, [ connection.ID ]: connection } ),
	[ PUBLICIZE_CONNECTION_DELETE ]: ( state, { connection: { ID } } ) => omit( state, ID ),
	[ PUBLICIZE_CONNECTION_UPDATE ]: ( state, { connection } ) => ( { ...state, [ connection.ID ]: connection } ),
}, connectionsSchema );

export default combineReducers( {
	fetchingConnections,
	connections,
	sharePostStatus
} );
