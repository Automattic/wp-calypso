/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_REQUEST_FAILURE,
	JETPACK_SETTINGS_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
	JETPACK_SETTINGS_UPDATE_FAILURE
} from 'state/action-types';
import { createReducer } from 'state/utils';

const createRequestsReducer = ( data ) => {
	return ( state, { siteId } ) => {
		return Object.assign( {}, state, {
			[ siteId ]: data
		} );
	};
};

const createItemsReducer = () => {
	return ( state, { siteId, settings } ) => {
		return merge( {}, state, {
			[ siteId ]: settings
		} );
	};
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack settings updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ JETPACK_SETTINGS_RECEIVE ]: createItemsReducer(),
	[ JETPACK_SETTINGS_UPDATE_SUCCESS ]: createItemsReducer()
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack settings related requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = createReducer( {}, {
	[ JETPACK_SETTINGS_REQUEST ]: createRequestsReducer( { requesting: true } ),
	[ JETPACK_SETTINGS_REQUEST_FAILURE ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_SETTINGS_REQUEST_SUCCESS ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_SETTINGS_UPDATE ]: createRequestsReducer( { updating: true } ),
	[ JETPACK_SETTINGS_UPDATE_FAILURE ]: createRequestsReducer( { updating: false } ),
	[ JETPACK_SETTINGS_UPDATE_SUCCESS ]: createRequestsReducer( { updating: false } ),
} );

export const reducer = combineReducers( {
	items,
	requests
} );
