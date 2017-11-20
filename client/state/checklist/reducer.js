/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { SITE_CHECKLIST_RECEIVE } from 'state/action-types';
import { items as itemSchemas } from './schema';

export const items = createReducer(
	{},
	{
		[ SITE_CHECKLIST_RECEIVE ]: ( state, content ) => ( {
			...state,
			[ content.siteId ]: content.checklist,
		} ),
	},
	itemSchemas
);

export default combineReducers( {
	items,
} );
