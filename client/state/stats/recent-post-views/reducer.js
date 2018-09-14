/** @format */

/**
 * External dependencies
 */

import { get, merge } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { items as itemsSchemas } from './schema';
import {
	STATS_RECENT_POST_VIEWS_REQUEST,
	STATS_RECENT_POST_VIEWS_RECEIVE,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case STATS_RECENT_POST_VIEWS_REQUEST:
		case STATS_RECENT_POST_VIEWS_RECEIVE:
			return merge( {}, state, {
				[ action.siteId ]:
					STATS_RECENT_POST_VIEWS_RECEIVE !== action.type ? action.postIds.split( ',' ) : false,
			} );
	}

	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the value of the stat.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case STATS_RECENT_POST_VIEWS_RECEIVE: {
			const viewsForState = {};
			action.posts.forEach( post => {
				viewsForState[ post.ID ] = { views: post.views };
			} );

			return {
				...state,
				[ action.siteId ]: {
					...get( state, [ action.siteId ], {} ),
					...viewsForState,
				},
			};
		}
	}

	return state;
}
items.schema = itemsSchemas;

export default combineReducers( {
	requesting,
	items,
} );
