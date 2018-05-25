/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SELECT_RESULT,
	INLINE_HELP_SELECT_NEXT_RESULT,
	INLINE_HELP_SELECT_PREVIOUS_RESULT,
	INLINE_HELP_CONTACT_FORM_RESET,
	INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
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
			const results = action.searchResults;

			return Object.assign( {}, state, {
				selectedResult: results.length ? 0 : -1,
				items: {
					...state.items,
					[ action.searchQuery ]: results,
				},
			} );
		},
		[ INLINE_HELP_SELECT_RESULT ]: ( state, action ) => ( {
			...state,
			selectedResult: action.resultIndex,
		} ),
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

export const contactForm = createReducer(
	{
		isShowingQandASuggestions: false,
	},
	{
		[ INLINE_HELP_CONTACT_FORM_RESET ]: state => ( {
			...state,
			isShowingQandASuggestions: false,
		} ),
		[ INLINE_HELP_CONTACT_FORM_SHOW_QANDA ]: state => ( {
			...state,
			isShowingQandASuggestions: true,
		} ),
	}
);

export default combineReducers( { requesting, search, contactForm } );
