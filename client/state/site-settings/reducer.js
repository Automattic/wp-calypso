/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import exporter from './exporter/reducers';
import { items as itemSchemas } from './schema';
import {
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( {}, {
	[ SITE_SETTINGS_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ SITE_SETTINGS_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ SITE_SETTINGS_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Returns the updated saving requests state after an action has been dispatched. The
 * state maps site ID to whether a save request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const saving = createReducer( {}, {
	[ SITE_SETTINGS_SAVE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ SITE_SETTINGS_SAVE_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ SITE_SETTINGS_SAVE_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the site settings object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ SITE_SETTINGS_RECEIVE ]: ( state, { siteId, settings } ) => ( { ...state, [ siteId ]: settings } ),
	[ SITE_SETTINGS_UPDATE ]: ( state, { siteId, settings } ) => ( {
		...state,
		[ siteId ]: {
			...( get( state, [ siteId ], {} ) ),
			...settings
		}
	} )
}, itemSchemas );

export default combineReducers( {
	exporter,
	items,
	requesting,
	saving
} );
