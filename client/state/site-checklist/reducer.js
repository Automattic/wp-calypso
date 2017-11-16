/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { items as itemSchemas } from './schema';
import {
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_REQUEST,
	SITE_CHECKLIST_REQUEST_FAILURE,
	SITE_CHECKLIST_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer(
	{},
	{
		[ SITE_CHECKLIST_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
		[ SITE_CHECKLIST_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: false,
		} ),
		[ SITE_CHECKLIST_REQUEST_FAILURE ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: false,
		} ),
	}
);

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the site settings object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer(
	{},
	{
		[ SITE_CHECKLIST_RECEIVE ]: ( state, { siteId, checklist } ) => ( {
			...state,
			[ siteId ]: checklist,
		} ),
	},
	itemSchemas
);

export default combineReducers( {
	items,
	requesting,
} );
