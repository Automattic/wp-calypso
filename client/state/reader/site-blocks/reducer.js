/**
 * Internal dependencies
 */
import {
	READER_SITE_BLOCK_REQUEST,
	READER_SITE_UNBLOCK_REQUEST,
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
} from 'state/action-types';
import { createReducer, keyedReducer } from 'state/utils';

/**
 * Tracks all known site block statuses, indexed by site ID.
 */
export const items = keyedReducer( 'siteId', createReducer( {}, {
	[ READER_SITE_BLOCK_REQUEST ]: () => true, // optimistic update
	[ READER_SITE_BLOCK_REQUEST_SUCCESS ]: ( state, action ) => action.data.success,
	[ READER_SITE_UNBLOCK_REQUEST ]: () => false, // optimistic update
	[ READER_SITE_UNBLOCK_REQUEST_SUCCESS ]: ( state, action ) => ! action.data.success,
} ) );

export default items;

