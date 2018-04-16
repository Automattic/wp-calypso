/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	GOOGLE_MY_BUSINESS_CONNECT_LOCATION,
	GOOGLE_MY_BUSINESS_DISCONNECT_LOCATION,
	GOOGLE_MY_BUSINESS_STATS_RECEIVE,
	GOOGLE_MY_BUSINESS_STATS_REQUEST,
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

const stats = createReducer( null, {
	[ GOOGLE_MY_BUSINESS_STATS_RECEIVE ]: ( state, { data } ) => data,
	[ GOOGLE_MY_BUSINESS_STATS_REQUEST ]: () => null,
} );

export default keyedReducer( 'siteId', combineReducers( { location, stats } ) );

