/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { RIVET_SUGGESTIONS_RECEIVE } from 'state/action-types';

export const suggestions = createReducer( null, {
	[ RIVET_SUGGESTIONS_RECEIVE ]: ( state, action ) => action.suggestions || [],
} );

export default combineReducers( {
	suggestions,
} );
