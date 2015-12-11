/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import indexBy from 'lodash/collection/indexBy';

/**
 * Internal dependencies
 */
import {
	FETCH_PUBLICIZE_CONNECTIONS,
	RECEIVE_PUBLICIZE_CONNECTIONS,
	FAIL_PUBLICIZE_CONNECTIONS_REQUEST
} from 'state/action-types';

/**
 * Track the current status for fetching connections. Maps site ID to the
 * fetching status for that site. Assigns `true` for currently fetching,
 * `false` for done or failed fetching, or `undefined` if no fetch attempt
 * has been made for the site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function fetchingConnections( state = {}, action ) {
	switch ( action.type ) {
		case FETCH_PUBLICIZE_CONNECTIONS:
		case RECEIVE_PUBLICIZE_CONNECTIONS:
		case FAIL_PUBLICIZE_CONNECTIONS_REQUEST:
			const { type, siteId } = action;
			state = Object.assign( {}, state, {
				[ siteId ]: FETCH_PUBLICIZE_CONNECTIONS === type
			} );
			break;
	}

	return state;
}

/**
 * Tracks all known connection objects, indexed by connection ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function connections( state = {}, action ) {
	switch ( action.type ) {
		case RECEIVE_PUBLICIZE_CONNECTIONS:
			state = Object.assign( {}, state, indexBy( action.data.connections, 'ID' ) );
			break;
	}

	return state;
}

/**
 * Tracks known connections for a site. Maps site ID to an array of connection
 * IDs. When new connections are received, existing known connections for the
 * site ID contained in the action payload are destroyed.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function connectionsBySiteId( state = {}, action ) {
	switch ( action.type ) {
		case RECEIVE_PUBLICIZE_CONNECTIONS:
			state = Object.assign( {}, state, {
				[ action.siteId ]: action.data.connections.map( ( connection ) => connection.ID )
			} );
			break;
	}

	return state;
}

export default combineReducers( {
	fetchingConnections,
	connections,
	connectionsBySiteId
} );
