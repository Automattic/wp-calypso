/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import {
	SITE_CONNECTION_STATUS_RECEIVE,
	SITE_CONNECTION_STATUS_REQUEST,
	SITE_CONNECTION_STATUS_REQUEST_FAILURE,
	SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
} from 'state/action-types';

export const items = createReducer( {}, {
	[ SITE_CONNECTION_STATUS_RECEIVE ]: ( state, { siteId, status } ) => ( { ...state, [ siteId ]: status } ),
} );

export const requesting = keyedReducer( 'siteId', createReducer( {}, {
	[ SITE_CONNECTION_STATUS_REQUEST ]: stubTrue,
	[ SITE_CONNECTION_STATUS_REQUEST_SUCCESS ]: stubFalse,
	[ SITE_CONNECTION_STATUS_REQUEST_FAILURE ]: stubFalse,
} ) );

export default combineReducers( {
	items,
	requesting,
} );
