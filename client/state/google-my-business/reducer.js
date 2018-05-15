/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	GOOGLE_MY_BUSINESS_STATS_FAILURE,
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
} from 'state/action-types';

const stats = createReducer( null, {
	[ GOOGLE_MY_BUSINESS_STATS_RECEIVE ]: ( state, { data } ) => data,
	[ GOOGLE_MY_BUSINESS_STATS_REQUEST ]: () => null,
	[ GOOGLE_MY_BUSINESS_STATS_FAILURE ]: () => false,
} );

export default keyedReducer(
	'siteId',
	combineReducers( {
		stats: keyedReducer(
			'statType',
			keyedReducer( 'interval', keyedReducer( 'aggregation', stats ) )
		),
	} )
);
