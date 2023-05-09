import { get } from 'lodash';
import { STATS_RECENT_POST_VIEWS_RECEIVE } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { items as itemsSchemas } from './schema';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, post ID and stat keys to the value of the stat.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( itemsSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case STATS_RECENT_POST_VIEWS_RECEIVE: {
			const viewsForState = {};
			action.posts.forEach( ( post ) => {
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
} );

export default combineReducers( {
	items,
} );
