/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	RIVET_SUGGESTIONS_ERROR,
	RIVET_SUGGESTIONS_RECEIVE,
	RIVET_SUGGESTIONS_REQUEST,
} from 'state/action-types';

export const error = createReducer( null, {
	[ RIVET_SUGGESTIONS_ERROR ]: ( state, action ) => action.error,
} );

export const isRequesting = createReducer( false, {
	[ RIVET_SUGGESTIONS_ERROR ]: () => false,
	[ RIVET_SUGGESTIONS_RECEIVE ]: () => false,
	[ RIVET_SUGGESTIONS_REQUEST ]: () => true,
} );

export const suggestions = createReducer( null, {
	[ RIVET_SUGGESTIONS_RECEIVE ]: ( state, action ) => action.suggestions || [],
} );

export default combineReducers( {
	error,
	isRequesting,
	suggestions,
} );
