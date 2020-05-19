/**
 * External dependencies
 */

import { keyBy, mapValues, omit, union, without } from 'lodash';

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
} from 'state/action-types';
import { combineReducers } from 'state/utils';
import { getSerializedQuery, normalizeFollower } from 'state/followers/utils';
import { FOLLOWERS_PER_PAGE } from 'state/followers/constants';

export function items( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
			return Object.assign(
				{},
				state,
				keyBy( action.data.subscribers.map( normalizeFollower ), 'ID' )
			);
		case FOLLOWER_REMOVE_SUCCESS:
			return Object.assign( {}, omit( state, action.follower.ID ) );
	}
	return state;
}

export function queries( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
			const serializedQuery = getSerializedQuery( action.query );
			const ids = state[ serializedQuery ] ? state[ serializedQuery ].ids : [];
			return Object.assign( {}, state, {
				[ serializedQuery ]: {
					ids: union(
						ids,
						action.data.subscribers.map( ( follower ) => follower.ID )
					),
					total: action.data.total,
					lastPage: action.data.pages,
				},
			} );
		case FOLLOWER_REMOVE_SUCCESS:
			return Object.assign(
				{},
				mapValues( state, ( query ) => {
					if ( query.ids.indexOf( action.follower.ID ) >= 0 ) {
						const total = query.total - 1;
						const lastPage = Math.ceil( total / FOLLOWERS_PER_PAGE );
						return {
							ids: without( query.ids, action.follower.ID ),
							total: total,
							lastPage: Math.max( lastPage, 1 ),
						};
					}
					return query;
				} )
			);
	}
	return state;
}

/**
 * Returns the updated state for in-progress network calls to fetch followers
 * for a given query.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWERS_RECEIVE:
		case FOLLOWERS_REQUEST:
		case FOLLOWERS_REQUEST_ERROR:
			const serializedQuery = getSerializedQuery( action.query );
			return Object.assign( {}, state, { [ serializedQuery ]: FOLLOWERS_REQUEST === action.type } );
	}
	return state;
}

export function removeFromSiteRequests( state = {}, action ) {
	switch ( action.type ) {
		case FOLLOWER_REMOVE_ERROR:
		case FOLLOWER_REMOVE_REQUEST:
		case FOLLOWER_REMOVE_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: FOLLOWER_REMOVE_REQUEST === action.type,
			} );
	}
	return state;
}

export default combineReducers( {
	items,
	queries,
	queryRequests,
	removeFromSiteRequests,
} );
