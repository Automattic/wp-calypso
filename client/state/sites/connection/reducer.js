/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	SITE_CONNECTION_STATUS_RECEIVE,
	SITE_CONNECTION_STATUS_REQUEST,
	SITE_CONNECTION_STATUS_REQUEST_FAILURE,
	SITE_CONNECTION_STATUS_REQUEST_SUCCESS,
} from 'state/action-types';

const createRequestingReducer = ( requesting ) =>
	( state, { siteId } ) => ( { ...state, [ siteId ]: requesting } );

export const items = createReducer( {}, {
	[ SITE_CONNECTION_STATUS_RECEIVE ]: ( state, { siteId, status } ) => ( { ...state, [ siteId ]: status } ),
} );

export const requesting = createReducer( {}, {
	[ SITE_CONNECTION_STATUS_REQUEST ]: createRequestingReducer( true ),
	[ SITE_CONNECTION_STATUS_REQUEST_FAILURE ]: createRequestingReducer( false ),
	[ SITE_CONNECTION_STATUS_REQUEST_SUCCESS ]: createRequestingReducer( false ),
} );

export default combineReducers( {
	items,
	requesting,
} );
