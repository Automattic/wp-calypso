/**
 * Internal dependencies
 */
import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
	PLANS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withStorageKey } from 'calypso/state/utils';
import { itemsSchema } from './schema';

/**
 * Plans `Reducer` function
 * root state -> state.plans.items =>
 * [ {}, {}, ... {} ]
 *
 * @param {object} state - current state
 * @param {object} action - plans action
 * @returns {object} updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case PLANS_RECEIVE:
			return action.plans.slice( 0 );
	}

	return state;
} );

/**
 * `Reducer` function which handles request/response actions
 * to/from WP REST-API
 *
 * @param {object} state - current state
 * @param {object} action - plans action
 * @returns {object} updated state
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
 * @param {object} state - current state
 * @param {object} action - plans action
 * @returns {object} updated state
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

const combinedReducer = combineReducers( {
	items,
	requesting,
	error,
} );

export default withStorageKey( 'plans', combinedReducer );
