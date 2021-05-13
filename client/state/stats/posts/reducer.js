/**
 * External dependencies
 */
import { get, merge } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { items as itemSchemas } from './schema';
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_FAILURE,
	POST_STATS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to whether a request is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_STATS_REQUEST:
		case POST_STATS_REQUEST_SUCCESS:
		case POST_STATS_REQUEST_FAILURE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: {
						[ action.fields.join() ]: POST_STATS_REQUEST === action.type,
					},
				},
			} );
	}

	return state;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the value of the stat.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case POST_STATS_RECEIVE:
			return {
				...state,
				[ action.siteId ]: {
					...get( state, [ action.siteId ], {} ),
					[ action.postId ]: {
						...get( state, [ action.siteId, action.postId ], {} ),
						...action.stats,
					},
				},
			};
	}

	return state;
} );

export default combineReducers( {
	requesting,
	items,
} );
