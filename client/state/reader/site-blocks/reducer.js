/** @format */
/**
 * Internal dependencies
 */
import { READER_SITE_BLOCK, READER_SITE_UNBLOCK } from 'client/state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'client/state/utils';

/**
 * Tracks all known site block statuses, indexed by site ID.
 */
export const items = keyedReducer(
	'payload.siteId',
	createReducer(
		{},
		{
			[ READER_SITE_BLOCK ]: () => true,
			[ READER_SITE_UNBLOCK ]: () => false,
		}
	)
);

export default combineReducers( {
	items,
} );
