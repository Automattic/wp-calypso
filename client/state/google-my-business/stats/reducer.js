/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL } from 'state/action-types';

export const statInterval = keyedReducer(
	'siteId',
	keyedReducer(
		'statType',
		createReducer( 'week', {
			[ GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL ]: ( state, { interval } ) => interval,
		} )
	)
);

export default combineReducers( {
	statInterval,
} );
