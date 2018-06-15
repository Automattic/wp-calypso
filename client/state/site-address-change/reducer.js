/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	SITE_ADDRESS_AVAILABILITY_REQUEST,
	SITE_ADDRESS_AVAILABILITY_SUCCESS,
	SITE_ADDRESS_AVAILABILITY_ERROR,
	SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR,
	SITE_ADDRESS_CHANGE_REQUEST,
	SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
	SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated request state after an action has been dispatched. The
 * state maps site ID keys to a boolean value. Each site is true if
 * a site-rename request is currently taking place, and false otherwise.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated rename request state
 */
export const requesting = createReducer(
	{},
	{
		[ SITE_ADDRESS_CHANGE_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
		[ SITE_ADDRESS_CHANGE_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: false,
		} ),
		[ SITE_ADDRESS_CHANGE_REQUEST_FAILURE ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: false,
		} ),
	}
);

/**
 * Returns the updated site-rename state after an action has been dispatched.
 * Saving state tracks whether the settings for a site are currently being saved.
 *
 * @param  {Object} state 	Current rename requesting state
 * @param  {Object} action 	Action object
 * @return {Object} 		Updated rename request state
 */
export const status = createReducer(
	{},
	{
		[ SITE_ADDRESS_CHANGE_REQUEST ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: {
				status: 'pending',
				error: false,
			},
		} ),
		[ SITE_ADDRESS_CHANGE_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: {
				status: 'success',
				error: false,
			},
		} ),
		[ SITE_ADDRESS_CHANGE_REQUEST_FAILURE ]: ( state, { siteId, error } ) => ( {
			...state,
			[ siteId ]: {
				status: 'error',
				error,
			},
		} ),
	}
);

export const validation = createReducer(
	{},
	{
		[ SITE_ADDRESS_AVAILABILITY_REQUEST ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: {
				...get( state, siteId, {} ),
				pending: true,
				error: null,
				isAvailable: null,
			},
		} ),
		[ SITE_ADDRESS_AVAILABILITY_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: {
				...get( state, siteId, {} ),
				pending: false,
				error: null,
				isAvailable: true,
			},
		} ),
		[ SITE_ADDRESS_AVAILABILITY_ERROR ]: ( state, { siteId, errorType, message } ) => ( {
			...state,
			[ siteId ]: {
				...get( state, siteId, {} ),
				isAvailable: false,
				pending: false,
				error: {
					errorType,
					message,
				},
			},
		} ),
		[ SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: {
				...get( state, siteId, {} ),
				error: null,
				isAvailable: null,
			},
		} ),
	}
);

export default combineReducers( {
	validation,
	status,
	requesting,
} );
