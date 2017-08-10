/** @format */
/**
 * Internal dependencies
 */
import {
	GEO_RECEIVE,
	GEO_REQUEST,
	GEO_REQUEST_FAILURE,
	GEO_REQUEST_SUCCESS,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { geoSchema } from './schema';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a geolocation request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const requesting = createReducer( false, {
	[ GEO_REQUEST ]: () => true,
	[ GEO_REQUEST_FAILURE ]: () => false,
	[ GEO_REQUEST_SUCCESS ]: () => false,
} );

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks current browser IP geolocation.
 *
 * @param  {?Object} state  Current state
 * @param  {Object}  action Action object
 * @return {?Object}        Updated state
 */
export const geo = createReducer(
	null,
	{
		[ GEO_RECEIVE ]: ( state, action ) => action.geo,
	},
	geoSchema
);

export default combineReducers( {
	requesting,
	geo,
} );
