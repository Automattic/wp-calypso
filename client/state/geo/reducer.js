/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	GEO_RECEIVE,
	GEO_REQUEST,
	GEO_REQUEST_FAILURE,
	GEO_REQUEST_SUCCESS
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { geoSchema } from './schema';

export const requesting = createReducer( false, {
	[ GEO_REQUEST ]: () => true,
	[ GEO_REQUEST_FAILURE ]: () => false,
	[ GEO_REQUEST_SUCCESS ]: () => false
} );

export const geo = createReducer( null, {
	[ GEO_RECEIVE ]: ( state, action ) => action.geo
}, geoSchema );

export default combineReducers( {
	requesting,
	geo
} );
