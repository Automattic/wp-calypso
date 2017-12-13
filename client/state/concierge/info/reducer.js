/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { CONCIERGE_INFO_UPDATE } from 'state/action-types';

export const message = createReducer( null, {
	[ CONCIERGE_INFO_UPDATE ]: ( state, action ) => action.info.message,
} );

export const timezone = createReducer( null, {
	[ CONCIERGE_INFO_UPDATE ]: ( state, action ) => action.info.timezone,
} );

export const reducer = combineReducers( {
	message,
	timezone,
} );

export default keyedReducer( 'siteId', reducer );
