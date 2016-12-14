/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE
} from 'state/action-types';
import { createReducer } from 'state/utils';

const createRequestReducer = ( requesting ) => {
	return ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: requesting
	} );
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ JETPACK_CONNECTION_STATUS_RECEIVE ]: ( state, { siteId, status } ) => Object.assign( {}, state, { [ siteId ]: status } )
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack connection requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = createReducer( {}, {
	[ JETPACK_CONNECTION_STATUS_REQUEST ]: createRequestReducer( true ),
	[ JETPACK_CONNECTION_STATUS_REQUEST_FAILURE ]: createRequestReducer( false ),
	[ JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS ]: createRequestReducer( false )
} );

export const reducer = combineReducers( {
	items,
	requests
} );
