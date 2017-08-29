/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { ZONINATOR_UPDATE_FEED } from '../action-types';

const feed = createReducer( {}, {
	[ ZONINATOR_UPDATE_FEED ]: ( state, { postIds } ) => postIds,
} );

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', feed ) );

export default combineReducers( { items } );
