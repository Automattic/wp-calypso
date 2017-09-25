/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { remoteValuesSchema } from './schema';
import { PREFERENCES_SET, PREFERENCES_RECEIVE, PREFERENCES_FETCH, PREFERENCES_FETCH_SUCCESS, PREFERENCES_FETCH_FAILURE, PREFERENCES_SAVE_SUCCESS } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

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
export const localValues = createReducer( {}, {
	[ PREFERENCES_SET ]: ( state, { key, value } ) => {
		if ( state[ key ] === value ) {
			return state;
		}

		return { ...state, [ key ]: value };
	},
	[ PREFERENCES_SAVE_SUCCESS ]: ( state, { key } ) => {
		return omit( state, key );
	}
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
export const remoteValues = createReducer( null, {
	[ PREFERENCES_RECEIVE ]: ( state, { values } ) => values
}, remoteValuesSchema );

export const fetching = createReducer( false, {
	[ PREFERENCES_FETCH_SUCCESS ]: () => false,
	[ PREFERENCES_FETCH_FAILURE ]: () => false,
	[ PREFERENCES_FETCH ]: () => true,
} );

const lastFetchedTimestamp = createReducer( false, {
	[ PREFERENCES_FETCH_SUCCESS ]: () => Date.now(),
} );

export default combineReducers( {
	localValues,
	remoteValues,
	fetching,
	lastFetchedTimestamp,
} );
