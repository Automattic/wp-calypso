/**
 * Internal dependencies
 *
 * @format
 */

import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { ZONINATOR_UPDATE_FEED } from '../action-types';

const feed = createReducer(
	{},
	{
		[ ZONINATOR_UPDATE_FEED ]: ( state, { posts } ) => posts,
	}
);

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', feed ) );

export default combineReducers( { items } );
