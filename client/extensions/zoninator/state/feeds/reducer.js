/**
 * Internal dependencies
 */
import { ZONINATOR_UPDATE_FEED } from '../action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

const feed = createReducer( {}, {
	[ ZONINATOR_UPDATE_FEED ]: ( state, { posts } ) => posts,
} );

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', feed ) );

export default combineReducers( { items } );
