/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	GOOGLE_MY_BUSINESS_CONNECT_LOCATION,
	GOOGLE_MY_BUSINESS_DISCONNECT_LOCATION,
	GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL,
	GOOGLE_MY_BUSINESS_STATS_SET_DATA,
} from 'state/action-types';

const location = createReducer(
	{ id: null },
	{
		[ GOOGLE_MY_BUSINESS_CONNECT_LOCATION ]: ( state, { locationId } ) => ( {
			id: locationId,
		} ),
		[ GOOGLE_MY_BUSINESS_DISCONNECT_LOCATION ]: () => ( {
			id: null,
		} ),
	}
);

const statInterval = createReducer( 'week', {
	[ GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL ]: ( state, { interval } ) => interval,
} );

const stats = createReducer( null, {
	[ GOOGLE_MY_BUSINESS_STATS_SET_DATA ]: ( state, { timeSpan, statName, data } ) => ( {
		...state,
		[ statName + '_' + timeSpan ]: data,
	} ),
} );

export default keyedReducer(
	'siteId',
	combineReducers( {
		location,
		statInterval: keyedReducer( 'statType', statInterval ),
		stats,
	} )
);
