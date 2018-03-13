/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SELECT_NEXT_RESULT,
	INLINE_HELP_SELECT_PREVIOUS_RESULT,
} from 'state/action-types';

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case INLINE_HELP_SEARCH_REQUEST:
		case INLINE_HELP_SEARCH_REQUEST_SUCCESS:
		case INLINE_HELP_SEARCH_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.searchQuery ]: INLINE_HELP_SEARCH_REQUEST === action.type,
			} );
	}

	return state;
}

export const search = createReducer(
	{
		searchQuery: '',
		items: {},
		selectedResult: -1,
		shouldOpenSelectedResult: false,
	},
	{
		[ INLINE_HELP_SEARCH_REQUEST ]: ( state, action ) => {
			return Object.assign( {}, state, {
				searchQuery: action.searchQuery,
			} );
		},
		[ INLINE_HELP_SEARCH_REQUEST_SUCCESS ]: ( state, action ) => {
			return Object.assign( {}, state, {
				selectedResult: -1,
				items: {
					...state.items,
					[ action.searchQuery ]: action.searchResults,
				},
			} );
		},
		[ INLINE_HELP_SELECT_NEXT_RESULT ]: state => {
			if ( state.items[ state.searchQuery ] && state.items[ state.searchQuery ].length ) {
				return Object.assign( {}, state, {
					selectedResult: ( state.selectedResult + 1 ) % state.items[ state.searchQuery ].length,
				} );
			}
			return Object.assign( {}, state, {
				selectedResult: -1,
			} );
		},
		[ INLINE_HELP_SELECT_PREVIOUS_RESULT ]: state => {
			if ( state.items[ state.searchQuery ] && state.items[ state.searchQuery ].length ) {
				const newResult = ( state.selectedResult - 1 ) % state.items[ state.searchQuery ].length;
				return Object.assign( {}, state, {
					selectedResult: newResult < 0 ? state.items[ state.searchQuery ].length - 1 : newResult,
				} );
			}
			return Object.assign( {}, state, {
				selectedResult: -1,
			} );
		},
	}
);

export default combineReducers( { requesting, search } );
