import { withStorageKey } from '@automattic/state-utils';
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE,
	PREFERENCES_SAVE_SUCCESS,
	PREFERENCES_SAVE_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { remoteValuesSchema } from './schema';

/**
 * Returns the updated local values state after an action has been dispatched.
 * The local values state reflects preferences which are not saved to the
 * remote endpoint. If a local value is set and then later saved to the remote,
 * it will be removed from state.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const localValues = ( state = {}, action ) => {
	switch ( action.type ) {
		case PREFERENCES_SET: {
			const { key, value } = action;
			if ( state[ key ] === value ) {
				return state;
			}

			return { ...state, [ key ]: value };
		}
		case PREFERENCES_SAVE_SUCCESS: {
			const { [ action.key ]: removed, ...rest } = state;
			return rest;
		}
	}

	return state;
};

/**
 * Returns the updated remote values state after an action has been dispatched.
 * The remote values state reflects preferences which are persisted to the REST
 * API current user settings endpoint.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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

export const fetching = ( state = false, action ) => {
	switch ( action.type ) {
		case PREFERENCES_FETCH_SUCCESS:
			return false;
		case PREFERENCES_FETCH_FAILURE:
			return false;
		case PREFERENCES_FETCH:
			return true;
	}

	return state;
};

export const saving = ( state = false, action ) => {
	switch ( action.type ) {
		case PREFERENCES_SET:
			return true;
		case PREFERENCES_SAVE_SUCCESS:
		case PREFERENCES_SAVE_FAILURE:
			return false;
	}
	return state;
};

const lastFetchedTimestamp = ( state = false, action ) => {
	switch ( action.type ) {
		case PREFERENCES_FETCH_SUCCESS:
			return Date.now();
	}

	return state;
};

const combinedReducer = combineReducers( {
	localValues,
	remoteValues,
	fetching,
	saving,
	lastFetchedTimestamp,
} );
const preferencesReducer = withStorageKey( 'preferences', combinedReducer );
export default preferencesReducer;
