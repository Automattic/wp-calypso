/** @format */

/**
 * Internal dependencies
 */

import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
	PLANS_REQUEST_FAILURE,
} from 'client/state/action-types';
import { combineReducers } from 'client/state/utils';
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
	}

	return state;
};
items.schema = itemsSchema;

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
	}

	return state;
};

export default combineReducers( {
	items,
	requesting,
	error,
} );
