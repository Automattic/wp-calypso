/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	withoutPersistence,
	withStorageKey,
} from 'calypso/state/utils';
import {
	GOOGLE_MY_BUSINESS_STATS_FAILURE,
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'calypso/state/action-types';
import { statsInterval } from 'calypso/state/google-my-business/ui/reducer';

const stats = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case GOOGLE_MY_BUSINESS_STATS_RECEIVE: {
			const { data } = action;
			return data;
		}
		case GOOGLE_MY_BUSINESS_STATS_REQUEST:
			return null;
		case GOOGLE_MY_BUSINESS_STATS_FAILURE:
			return null;
	}

	return state;
} );

const statsError = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case GOOGLE_MY_BUSINESS_STATS_RECEIVE:
			return null;
		case GOOGLE_MY_BUSINESS_STATS_REQUEST:
			return null;
		case GOOGLE_MY_BUSINESS_STATS_FAILURE: {
			const { error } = action;
			return error;
		}
	}

	return state;
} );

const combinedReducer = keyedReducer(
	'siteId',
	combineReducers( {
		stats: keyedReducer(
			'statType',
			keyedReducer( 'interval', keyedReducer( 'aggregation', stats ) )
		),
		statsError: keyedReducer(
			'statType',
			keyedReducer( 'interval', keyedReducer( 'aggregation', statsError ) )
		),
		statsInterval: keyedReducer( 'statType', statsInterval ),
	} )
);

export default withStorageKey( 'googleMyBusiness', combinedReducer );
