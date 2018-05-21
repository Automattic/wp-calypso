/** @format */

/**
 * External dependencies
 */
import { keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import { siteKeyrings as siteKeyringsSchema } from './schema';
import {
	SITE_KEYRINGS_REQUEST,
	SITE_KEYRINGS_REQUEST_FAILURE,
	SITE_KEYRINGS_REQUEST_SUCCESS,
	SITE_KEYRINGS_SAVE,
	SITE_KEYRINGS_SAVE_FAILURE,
	SITE_KEYRINGS_SAVE_SUCCESS,
	SITE_KEYRINGS_DELETE_SUCCESS,
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
		[ SITE_KEYRINGS_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
		[ SITE_KEYRINGS_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
		[ SITE_KEYRINGS_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
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
		[ SITE_KEYRINGS_SAVE ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: { saving: true, status: 'pending', error: false },
		} ),
		[ SITE_KEYRINGS_SAVE_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: { saving: false, status: 'success', error: false },
		} ),
		[ SITE_KEYRINGS_SAVE_FAILURE ]: ( state, { siteId, error } ) => ( {
			...state,
			[ siteId ]: { saving: false, status: 'error', error },
		} ),
	}
);

const siteKeyrings = createReducer(
	{},
	{
		[ SITE_KEYRINGS_REQUEST_SUCCESS ]: ( state, { keyrings } ) => keyBy( keyrings, 'keyring_id' ),
		[ SITE_KEYRINGS_SAVE_SUCCESS ]: ( state, { keyring } ) => ( {
			...state,
			[ keyring.keyring_id ]: keyring,
		} ),
		[ SITE_KEYRINGS_DELETE_SUCCESS ]: ( state, { keyringId } ) => omit( state, [ keyringId ] ),
	},
	siteKeyringsSchema
);

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the site keyrings object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = keyedReducer( 'siteId', siteKeyrings );

export default combineReducers( {
	items,
	requesting,
	saveRequests,
} );
