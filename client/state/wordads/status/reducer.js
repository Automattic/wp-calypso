/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	WORDADS_STATUS_REQUEST,
	WORDADS_STATUS_REQUEST_SUCCESS,
	WORDADS_STATUS_REQUEST_FAILURE
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { wordadsStatusSchema } from './schema';

export const items = createReducer( {}, {
	[ WORDADS_STATUS_REQUEST_SUCCESS ]: ( state, action ) => Object.assign( {}, state, {
		[ action.siteId ]: action.status
	} )
}, wordadsStatusSchema );

export const fetchingItems = createReducer( {}, {
	[ WORDADS_STATUS_REQUEST ]: ( state, action ) => Object.assign( {}, state, { [ action.siteId ]: true } ),
	[ WORDADS_STATUS_REQUEST_SUCCESS ]: ( state, action ) => Object.assign( {}, state, { [ action.siteId ]: false } ),
	[ WORDADS_STATUS_REQUEST_FAILURE ]: ( state, action ) => Object.assign( {}, state, { [ action.siteId ]: false } ),
} );

export default combineReducers( {
	items,
	fetchingItems
} );
