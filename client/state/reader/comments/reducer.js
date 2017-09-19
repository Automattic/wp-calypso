/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	READER_COMMENTS_SEARCH,
	READER_COMMENTS_SEARCH_FAILURE,
	READER_COMMENTS_SEARCH_SUCCESS,
} from 'state/action-types';

export const error = createReducer( null, {
	[ READER_COMMENTS_SEARCH ]: () => null,
	[ READER_COMMENTS_SEARCH_FAILURE ]: ( state, { error } ) => error,
	[ READER_COMMENTS_SEARCH_SUCCESS ]: () => null
} );

export const isRequesting = createReducer( false, {
	[ READER_COMMENTS_SEARCH ]: () => true,
	[ READER_COMMENTS_SEARCH_FAILURE ]: () => false,
	[ READER_COMMENTS_SEARCH_SUCCESS ]: () => false
} );

export const items = createReducer( null, {
	[ READER_COMMENTS_SEARCH ]: state => state,
	[ READER_COMMENTS_SEARCH_FAILURE ]: state => state,
	[ READER_COMMENTS_SEARCH_SUCCESS ]: ( state, { items } ) => items
} );

export const query = createReducer( null, {
	[ READER_COMMENTS_SEARCH ]: state => state,
	[ READER_COMMENTS_SEARCH_FAILURE ]: state => state,
	[ READER_COMMENTS_SEARCH_SUCCESS ]: ( state, { query } ) => query
} );

export default combineReducers( {
	error,
	isRequesting,
	items,
	query
} );
