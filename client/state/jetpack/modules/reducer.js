/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { forEach, get, merge, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE,
	JETPACK_MODULE_DEACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_MODULES_REQUEST,
	JETPACK_MODULES_REQUEST_FAILURE,
	JETPACK_MODULES_REQUEST_SUCCESS,
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
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

const createItemsListReducer = () => {
	return ( state, { siteId, modules } ) => {
		return merge( {}, state, {
			[ siteId ]: modules
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

const createModuleListRequestReducer = ( fetchingModules ) => {
	return ( state, { siteId } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				fetchingModules
			}
		} );
	};
};

const createSettingsItemsReducer = () => {
	return ( state, { siteId, settings } ) => {
		let updatedState = state;
		const moduleActivationState = pickBy( settings, ( settingValue, settingName ) => {
			return get( state, [ siteId, settingName ] ) !== undefined;
		} );

		forEach( moduleActivationState, ( active, moduleSlug ) => {
			updatedState = Object.assign( {}, updatedState, {
				[ siteId ]: {
					...updatedState[ siteId ],
					[ moduleSlug ]: {
						...updatedState[ siteId ][ moduleSlug ],
						active
					}
				}
			} );
		} );

		return updatedState;
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
	[ JETPACK_MODULES_RECEIVE ]: createItemsListReducer(),
	[ JETPACK_SETTINGS_RECEIVE ]: createSettingsItemsReducer(),
	[ JETPACK_SETTINGS_UPDATE_SUCCESS ]: createSettingsItemsReducer()
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
	[ JETPACK_MODULES_REQUEST ]: createModuleListRequestReducer( true ),
	[ JETPACK_MODULES_REQUEST_FAILURE ]: createModuleListRequestReducer( false ),
	[ JETPACK_MODULES_REQUEST_SUCCESS ]: createModuleListRequestReducer( false )
} );

export const reducer = combineReducers( {
	items,
	requests
} );
