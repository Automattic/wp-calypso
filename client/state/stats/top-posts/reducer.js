/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { items as itemSchemas } from './schema';
import {
	TOP_POSTS_RECEIVE,
	TOP_POSTS_REQUEST,
	TOP_POSTS_REQUEST_FAILURE,
	TOP_POSTS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, request date, period and num parameter to whether a
 * request is in progress.
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
			return {
				...state,
				[ action.siteId ]: {
					...get( state, [ action.siteId ], {} ),
					[ action.date + action.period + action.num ]: TOP_POSTS_REQUEST === action.type,
				},
			};
	}
	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, request date, period and num parameter to whether a
 * request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case TOP_POSTS_RECEIVE:
			return {
				...state,
				[ action.siteId ]: {
					...get( state, [ action.siteId ], {} ),
					[ action.date + action.period + action.num ]: action.postsByDay,
				},
			};
	}
	return state;
}
items.schema = itemSchemas;

export default combineReducers( {
	requesting,
	items,
} );
