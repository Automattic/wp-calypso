/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE,
	PREFERENCES_SAVE_SUCCESS,
} from 'state/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'state/utils';
import { remoteValuesSchema } from './schema';

/**
 * Returns the updated local values state after an action has been dispatched.
 * The local values state reflects preferences which are not saved to the
 * remote endpoint. If a local value is set and then later saved to the remote,
 * it will be removed from state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const localValues = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PREFERENCES_SET: {
			const { key, value } = action;
			if ( state[ key ] === value ) {
				return state;
			}

			return { ...state, [ key ]: value };
		}
		case PREFERENCES_SAVE_SUCCESS: {
			const { key } = action;
			return omit( state, key );
		}
	}

	return state;
} );

/**
 * Returns the updated remote values state after an action has been dispatched.
 * The remote values state reflects preferences which are persisted to the REST
 * API current user settings endpoint.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const remoteValues = withSchemaValidation( remoteValuesSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case PREFERENCES_RECEIVE: {
			const { values } = action;
			return values;
		}
	}

	return state;
} );

export const fetching = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case PREFERENCES_FETCH_SUCCESS:
			return false;
		case PREFERENCES_FETCH_FAILURE:
			return false;
		case PREFERENCES_FETCH:
			return true;
	}

	return state;
} );

const lastFetchedTimestamp = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case PREFERENCES_FETCH_SUCCESS:
			return Date.now();
	}

	return state;
} );

export default combineReducers( {
	localValues,
	remoteValues,
	fetching,
	lastFetchedTimestamp,
} );
