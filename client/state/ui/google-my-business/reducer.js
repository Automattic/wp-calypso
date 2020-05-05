/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withoutPersistence } from 'state/utils';
import { GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL } from 'state/action-types';

const statsInterval = withoutPersistence( ( state = 'week', action ) => {
	switch ( action.type ) {
		case GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL: {
			const { interval } = action;
			return interval;
		}
	}

	return state;
} );

export default keyedReducer(
	'siteId',
	combineReducers( { statsInterval: keyedReducer( 'statType', statsInterval ) } )
);
