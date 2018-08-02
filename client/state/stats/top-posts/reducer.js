/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	TOP_POSTS_RECEIVE,
	TOP_POSTS_REQUEST,
	TOP_POSTS_REQUEST_FAILURE,
	TOP_POSTS_REQUEST_SUCCESS,
} from 'state/action-types';
import { getSerializedTopPostsQuery } from './utils';
import { omit } from 'lodash';
import { items as itemSchemas } from './schema';

/**
 * Returns the updated requests state after an action has been dispatched.
 * The state maps the site ID and the query object to whether a request is in
 * progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case TOP_POSTS_REQUEST:
		case TOP_POSTS_REQUEST_FAILURE:
		case TOP_POSTS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedTopPostsQuery( action.query, action.siteId );
			const isRequesting = TOP_POSTS_REQUEST === action.type;
			if ( ! isRequesting ) {
				return omit( state, serializedQuery );
			}
			return {
				...state,
				[ serializedQuery ]: true,
			};
	}
	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps the site ID and the query object to whether a request is in
 * progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case TOP_POSTS_RECEIVE:
			const serializedQuery = getSerializedTopPostsQuery( action.query, action.siteId );
			return {
				...state,
				[ serializedQuery ]: action.postsByDay,
			};
	}
	return state;
}
items.schema = itemSchemas;

export default combineReducers( {
	requesting,
	items,
} );
