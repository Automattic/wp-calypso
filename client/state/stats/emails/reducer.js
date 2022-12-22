import { get } from 'lodash';
import { EMAIL_STATS_RECEIVE } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { items as itemSchemas } from './schema';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID, email ID and stat keys to the value of the stat.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case EMAIL_STATS_RECEIVE:
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
	items,
} );
