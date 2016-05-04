/**
 * External dependencies
 */
import keyBy from 'lodash/keyBy';
import union from 'lodash/union';
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	FOLLOWERS_RECEIVE,
	FOLLOWERS_REQUEST,
	FOLLOWERS_REQUEST_ERROR,
	FOLLOWER_REMOVE_ERROR,
	FOLLOWER_REMOVE_REQUEST,
	FOLLOWER_REMOVE_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { getSerializedQuery, normalizeFollower } from 'state/followers/utils';

export function items( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
			return Object.assign( {}, state, keyBy( action.data.subscribers.map( normalizeFollower ), 'ID' ) );
	}
	return state;
}

export function queries( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
			const serializedQuery = getSerializedQuery( action.query );
			const ids = state[ serializedQuery ] || [];
			return Object.assign( {}, state, {
				[ serializedQuery ]: union( ids, action.data.subscribers.map( ( follower ) => {
					return follower.ID;
				} ) )
			} );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Returns the updated state for in-progress network calls to fetch followers
 * for a given query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
		case FOLLOWERS_REQUEST:
		case FOLLOWERS_REQUEST_ERROR:
			const serializedQuery = getSerializedQuery( action.query );
			return Object.assign( {}, state, { [ serializedQuery ]: FOLLOWERS_REQUEST === action.type } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function queriesLastPage( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
			const serializedQuery = getSerializedQuery( action.query );
			return Object.assign( {}, state, { [ serializedQuery ]: action.data.pages } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function queriesTotal( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
			const serializedQuery = getSerializedQuery( action.query );
			return Object.assign( {}, state, { [ serializedQuery ]: action.data.total } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function removeFromSiteRequests( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWER_REMOVE_ERROR:
		case FOLLOWER_REMOVE_REQUEST:
		case FOLLOWER_REMOVE_SUCCESS:
			return Object.assign( {}, state, { [ action.siteId ]: FOLLOWER_REMOVE_REQUEST === action.type } );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	queries,
	queriesTotal,
	queryRequests,
	removeFromSiteRequests
} );
