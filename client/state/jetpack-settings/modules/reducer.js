/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS
} from 'state/action-types';

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules data updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = ( state = {}, { type, siteId, moduleSlug } ) => {
	switch ( type ) {
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			return merge( {}, state, {
				[ siteId ]: {
					[ moduleSlug ]: {
						active: true
					}
				}
			} );
		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
};

export const initialRequestsState = {
	activating: {},
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules-related requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = ( state = initialRequestsState, { type, siteId, moduleSlug } ) => {
	switch ( type ) {
		case JETPACK_MODULE_ACTIVATE:
			return merge( {}, state, {
				activating: {
					[ siteId ]: {
						[ moduleSlug ]: true
					}
				}
			} );
		case JETPACK_MODULE_ACTIVATE_FAILURE:
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			return merge( {}, state, {
				activating: {
					[ siteId ]: {
						[ moduleSlug ]: false
					}
				}
			} );
		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return initialRequestsState;
		default:
			return state;
	}
};

export const reducer = combineReducers( {
	items,
	requests
} );
