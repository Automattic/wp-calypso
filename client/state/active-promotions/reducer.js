/** @format */

/**
 * Internal dependencies
 */

import {
	ACTIVE_PROMOTIONS_RECEIVE,
	ACTIVE_PROMOTIONS_REQUEST,
	ACTIVE_PROMOTIONS_REQUEST_SUCCESS,
	ACTIVE_PROMOTIONS_REQUEST_FAILURE,
} from 'state/action-types';
import { combineReducers } from 'state/utils';
import { itemsSchema } from './schema';

/**
 * ActivePromotions `Reducer` function
 * root state -> state.activePromotions.items =>
 * [ {}, {}, ... {} ]
 *
 * @param {Object} state - current state
 * @param {Object} action - activePromotions action
 * @return {Object} updated state
 */
export const items = ( state = [], action ) => {
	switch ( action.type ) {
		case ACTIVE_PROMOTIONS_RECEIVE:
			return action.activePromotions.slice( 0 );
	}

	return state;
};
items.schema = itemsSchema;

/**
 * `Reducer` function which handles request/response actions
 * to/from WP REST-API
 *
 * @param {Object} state - current state
 * @param {Object} action - activePromotions action
 * @return {Object} updated state
 */
export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case ACTIVE_PROMOTIONS_REQUEST:
		case ACTIVE_PROMOTIONS_REQUEST_SUCCESS:
		case ACTIVE_PROMOTIONS_REQUEST_FAILURE:
			return action.type === ACTIVE_PROMOTIONS_REQUEST;
	}

	return state;
};

/**
 * `Reducer` function which handles ERROR REST-API response actions
 *
 * @param {Object} state - current state
 * @param {Object} action - activePromotions action
 * @return {Object} updated state
 */
export const error = ( state = false, action ) => {
	switch ( action.type ) {
		case ACTIVE_PROMOTIONS_REQUEST:
		case ACTIVE_PROMOTIONS_REQUEST_SUCCESS:
			return false;

		case ACTIVE_PROMOTIONS_REQUEST_FAILURE:
			return true;
	}

	return state;
};

export default combineReducers( {
	items,
	requesting,
	error,
} );
