/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE,
	JETPACK_MODULE_DEACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS
} from 'state/action-types';
import { createReducer } from 'state/utils';

const createItemsReducer = ( active ) => {
	return ( state, { siteId, moduleSlug } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				[ moduleSlug ]: {
					active
				}
			}
		} );
	};
};

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
 * concerning Jetpack modules data updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = createReducer( {}, {
	[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: createItemsReducer( true ),
	[ JETPACK_MODULE_DEACTIVATE_SUCCESS ]: createItemsReducer( false ),
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
	[ JETPACK_MODULE_ACTIVATE ]: createRequestsReducer( { activating: true } ),
	[ JETPACK_MODULE_ACTIVATE_FAILURE ]: createRequestsReducer( { activating: false } ),
	[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: createRequestsReducer( { activating: false } ),
	[ JETPACK_MODULE_DEACTIVATE ]: createRequestsReducer( { deactivating: true } ),
	[ JETPACK_MODULE_DEACTIVATE_FAILURE ]: createRequestsReducer( { deactivating: false } ),
	[ JETPACK_MODULE_DEACTIVATE_SUCCESS ]: createRequestsReducer( { deactivating: false } ),
} );

export const reducer = combineReducers( {
	items,
	requests
} );
