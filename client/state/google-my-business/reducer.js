/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withoutPersistence } from 'state/utils';
import {
	GOOGLE_MY_BUSINESS_STATS_FAILURE,
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'state/action-types';

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

export default keyedReducer(
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
	} )
);
