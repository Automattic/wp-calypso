/** @format */

/**
 * External dependencies
 */

import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { items as itemSchemas } from './schema';
import {
	MEDIA_DELETE,
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE,
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
		[ SITE_SETTINGS_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
		[ SITE_SETTINGS_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
		[ SITE_SETTINGS_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	}
);

/**
 * Returns the save Request status after an action has been dispatched. The
 * state maps site ID to the request status
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const saveRequests = createReducer(
	{},
	{
		[ SITE_SETTINGS_SAVE ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: { saving: true, status: 'pending', error: false },
		} ),
		[ SITE_SETTINGS_SAVE_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: { saving: false, status: 'success', error: false },
		} ),
		[ SITE_SETTINGS_SAVE_FAILURE ]: ( state, { siteId, error } ) => ( {
			...state,
			[ siteId ]: { saving: false, status: 'error', error },
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
		[ SITE_SETTINGS_RECEIVE ]: ( state, { siteId, settings } ) => ( {
			...state,
			[ siteId ]: settings,
		} ),
		[ SITE_SETTINGS_UPDATE ]: ( state, { siteId, settings } ) => ( {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				...settings,
			},
		} ),
		[ MEDIA_DELETE ]: ( state, { siteId, mediaIds } ) => {
			const settings = state[ siteId ];
			if ( ! settings || ! includes( mediaIds, settings.site_icon ) ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...settings,
					site_icon: null,
				},
			};
		},
	},
	itemSchemas
);

export default combineReducers( {
	items,
	requesting,
	saveRequests,
} );
