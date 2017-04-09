/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_JUMPSTART_ACTIVATE,
	JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_ACTIVATE_FAILURE,
	JETPACK_JUMPSTART_DEACTIVATE,
	JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_DEACTIVATE_FAILURE,
	JETPACK_JUMPSTART_STATUS_RECEIVE,
	JETPACK_JUMPSTART_STATUS_REQUEST,
	JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS,
	JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE
} from 'state/action-types';
import { createReducer } from 'state/utils';

const createRequestReducer = ( data ) => {
	return ( state, { siteId } ) => {
		return merge( {}, state, {
			[ siteId ]: data
		} );
	};
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules data updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ JETPACK_JUMPSTART_ACTIVATE_SUCCESS ]: ( state, { siteId } ) => Object.assign( {}, state, { [ siteId ]: 'jumpstart_activated' } ),
	[ JETPACK_JUMPSTART_DEACTIVATE_SUCCESS ]: ( state, { siteId } ) => Object.assign( {}, state, { [ siteId ]: 'jumpstart_dismissed' } ),
	[ JETPACK_JUMPSTART_STATUS_RECEIVE ]: ( state, { siteId, status } ) => Object.assign( {}, state, { [ siteId ]: status } )
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules-related requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = createReducer( {}, {
	[ JETPACK_JUMPSTART_ACTIVATE ]: createRequestReducer( { activating: true } ),
	[ JETPACK_JUMPSTART_ACTIVATE_FAILURE ]: createRequestReducer( { activating: false } ),
	[ JETPACK_JUMPSTART_ACTIVATE_SUCCESS ]: createRequestReducer( { activating: false } ),
	[ JETPACK_JUMPSTART_DEACTIVATE ]: createRequestReducer( { deactivating: true } ),
	[ JETPACK_JUMPSTART_DEACTIVATE_FAILURE ]: createRequestReducer( { deactivating: false } ),
	[ JETPACK_JUMPSTART_DEACTIVATE_SUCCESS ]: createRequestReducer( { deactivating: false } ),
	[ JETPACK_JUMPSTART_STATUS_REQUEST ]: createRequestReducer( { requesting: true } ),
	[ JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE ]: createRequestReducer( { requesting: false } ),
	[ JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS ]: createRequestReducer( { requesting: false } )
} );

export const reducer = combineReducers( {
	items,
	requests
} );
