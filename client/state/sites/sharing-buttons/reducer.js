/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { items as itemSchemas } from './schema';
import {
	SHARING_BUTTONS_RECEIVE,
	SHARING_BUTTONS_REQUEST,
	SHARING_BUTTONS_REQUEST_FAILURE,
	SHARING_BUTTONS_REQUEST_SUCCESS,
	SHARING_BUTTONS_SAVE,
	SHARING_BUTTONS_SAVE_FAILURE,
	SHARING_BUTTONS_SAVE_SUCCESS,
	SHARING_BUTTONS_UPDATE
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
	[ SHARING_BUTTONS_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ SHARING_BUTTONS_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ SHARING_BUTTONS_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Returns the save Request status after an action has been dispatched. The
 * state maps site ID to the request status
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const saveRequests = createReducer( {}, {
	[ SHARING_BUTTONS_SAVE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: { saving: true, status: 'pending' } } ),
	[ SHARING_BUTTONS_SAVE_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: { saving: false, status: 'success' } } ),
	[ SHARING_BUTTONS_SAVE_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: { saving: false, status: 'error' } } )
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the sharing buttons settings object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ SHARING_BUTTONS_RECEIVE ]: ( state, { siteId, settings } ) => ( { ...state, [ siteId ]: settings } ),
	[ SHARING_BUTTONS_UPDATE ]: ( state, { siteId, settings } ) => ( {
		...state,
		[ siteId ]: uniqBy( settings.concat( state[ siteId ] || [] ), 'ID' )
	} )
}, itemSchemas );

export default combineReducers( {
	items,
	requesting,
	saveRequests
} );
