/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { connectionsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

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
		case PUBLICIZE_CONNECTIONS_REQUEST:
		case PUBLICIZE_CONNECTIONS_RECEIVE:
		case PUBLICIZE_CONNECTIONS_REQUEST_FAILURE:
			const { type, siteId } = action;
			return Object.assign( {}, state, {
				[ siteId ]: PUBLICIZE_CONNECTIONS_REQUEST === type
			} );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
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
		case PUBLICIZE_CONNECTIONS_RECEIVE:
			return Object.assign( {}, state, keyBy( action.data.connections, 'ID' ) );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, connectionsSchema ) ) {
				return state;
			}
			return {};
	}

	return state;
}

export default combineReducers( {
	fetchingConnections,
	connections
} );
