/**
 * External dependencies
 */

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
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
} from 'state/action-types';
import { combineReducers, withoutPersistence } from 'state/utils';

const createItemsReducer = ( active ) => {
	return ( state, { siteId, moduleSlug } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				[ moduleSlug ]: {
					active,
				},
			},
		} );
	};
};

const createItemsListReducer = () => {
	return ( state, { siteId, modules } ) => {
		return merge( {}, state, {
			[ siteId ]: modules,
		} );
	};
};

const createRequestsReducer = ( data ) => {
	return ( state, { siteId, moduleSlug } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				[ moduleSlug ]: data,
			},
		} );
	};
};

const createModuleListRequestReducer = ( fetchingModules ) => {
	return ( state, { siteId } ) => {
		return merge( {}, state, {
			[ siteId ]: {
				fetchingModules,
			},
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
						active,
					},
				},
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
 * @param  {object} action action
 * @returns {Array}         Updated state
 */
export const items = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			return createItemsReducer( true )( state, action );
		case JETPACK_MODULE_DEACTIVATE_SUCCESS:
			return createItemsReducer( false )( state, action );
		case JETPACK_MODULES_RECEIVE:
			return createItemsListReducer()( state, action );
		case JETPACK_SETTINGS_UPDATE:
			return createSettingsItemsReducer()( state, action );
		case JETPACK_SETTINGS_SAVE_SUCCESS:
			return createSettingsItemsReducer()( state, action );
	}

	return state;
} );

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules-related requests
 *
 * @param {object} state - current state
 * @param {object} action - action
 * @returns {object} updated state
 */
export const requests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_MODULE_ACTIVATE:
			return createRequestsReducer( { activating: true } )( state, action );
		case JETPACK_MODULE_ACTIVATE_FAILURE:
			return createRequestsReducer( { activating: false } )( state, action );
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			return createRequestsReducer( { activating: false } )( state, action );
		case JETPACK_MODULE_DEACTIVATE:
			return createRequestsReducer( { deactivating: true } )( state, action );
		case JETPACK_MODULE_DEACTIVATE_FAILURE:
			return createRequestsReducer( { deactivating: false } )( state, action );
		case JETPACK_MODULE_DEACTIVATE_SUCCESS:
			return createRequestsReducer( { deactivating: false } )( state, action );
		case JETPACK_MODULES_REQUEST:
			return createModuleListRequestReducer( true )( state, action );
		case JETPACK_MODULES_REQUEST_FAILURE:
			return createModuleListRequestReducer( false )( state, action );
		case JETPACK_MODULES_REQUEST_SUCCESS:
			return createModuleListRequestReducer( false )( state, action );
	}

	return state;
} );

export const reducer = combineReducers( {
	items,
	requests,
} );
