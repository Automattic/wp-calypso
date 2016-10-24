/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
	PLANS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

import { isValidStateWithSchema } from 'state/utils';
import { itemsSchema } from './schema';

/**
 * Plans `Reducer` function
 * root state -> state.plans.items =>
 * [ {}, {}, ... {} ]
 *
 * @param {Object} state - current state
 * @param {Object} action - plans action
 * @return {Object} updated state
 */
export const items = ( state = [], action ) => {
	switch ( action.type ) {
		case PLANS_RECEIVE:
			return action.plans.slice( 0 );

		case DESERIALIZE:
			const isValidState = isValidStateWithSchema( state, itemsSchema );
			if ( isValidState ) {
				return state;
			}
			return [];
		case SERIALIZE:
			return state;
	}

	return state;
};

/**
 * `Reducer` function which handles request/response actions
 * to/from WP REST-API
 *
 * @param {Object} state - current state
 * @param {Object} action - plans action
 * @return {Object} updated state
 */
export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case PLANS_REQUEST:
		case PLANS_REQUEST_SUCCESS:
		case PLANS_REQUEST_FAILURE:
			return action.type === PLANS_REQUEST;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

/**
 * `Reducer` function which handles ERROR REST-API response actions
 *
 * @param {Object} state - current state
 * @param {Object} action - plans action
 * @return {Object} updated state
 */
export const error = ( state = false, action ) => {
	switch ( action.type ) {
		case PLANS_REQUEST:
		case PLANS_REQUEST_SUCCESS:
			return false;

		case PLANS_REQUEST_FAILURE:
			return true;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

export default combineReducers( {
	items,
	requesting,
	error
} );
