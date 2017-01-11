/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_SETTINGS_RECEIVE,
	JETPACK_MODULE_SETTINGS_REQUEST,
	JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
	JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE,
	JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE_FAILURE
} from 'state/action-types';
import { createReducer } from 'state/utils';

const createRequestsReducer = ( data ) => {
	return ( state, { siteId, moduleSlug } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				[ moduleSlug ]: data
			}
		} );
	};
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack module settings updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ JETPACK_MODULE_SETTINGS_RECEIVE ]: ( state, { siteId, moduleSlug, settings } ) => {
		return Object.assign( {}, state, {
			[ siteId ]: {
				...state[ siteId ],
				[ moduleSlug ]: settings
			}
		} );
	}
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules settings related requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = createReducer( {}, {
	[ JETPACK_MODULE_SETTINGS_REQUEST ]: createRequestsReducer( { requesting: true } ),
	[ JETPACK_MODULE_SETTINGS_REQUEST_FAILURE ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS ]: createRequestsReducer( { requesting: false } ),
	[ JETPACK_MODULE_SETTINGS_UPDATE ]: createRequestsReducer( { updating: true } ),
	[ JETPACK_MODULE_SETTINGS_UPDATE_FAILURE ]: createRequestsReducer( { updating: false } ),
	[ JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS ]: createRequestsReducer( { updating: false } ),
} );

export const reducer = combineReducers( {
	items,
	requests
} );
