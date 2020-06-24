/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence, withStorageKey } from 'state/utils';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
	INLINE_HELP_SELECT_RESULT,
	INLINE_HELP_SELECT_NEXT_RESULT,
	INLINE_HELP_SELECT_PREVIOUS_RESULT,
	INLINE_HELP_SET_QUERY_SEARCH,
	INLINE_HELP_CONTACT_FORM_RESET,
	INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_SHOW,
	INLINE_HELP_HIDE,
	INLINE_HELP_SEARCH_RESET,
} from 'state/action-types';

export const ui = withoutPersistence( ( state = { isVisible: true }, action ) => {
	switch ( action.type ) {
		case INLINE_HELP_SHOW:
			return { ...state, isVisible: true };
		case INLINE_HELP_HIDE:
			return { ...state, isVisible: false };
	}

	return state;
} );

export const popover = withoutPersistence( ( state = { isVisible: false }, action ) => {
	switch ( action.type ) {
		case INLINE_HELP_POPOVER_SHOW:
			return { ...state, isVisible: true };
		case INLINE_HELP_POPOVER_HIDE:
			return { ...state, isVisible: false };
	}

	return state;
} );

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case INLINE_HELP_SEARCH_REQUEST:
			return {
				...state,
				[ action.searchQuery ]: true,
			};
		case INLINE_HELP_SEARCH_REQUEST_SUCCESS:
		case INLINE_HELP_SEARCH_REQUEST_FAILURE:
		case INLINE_HELP_SEARCH_RESET:
			return {
				...state,
				[ action.searchQuery ]: false,
			};
	}

	return state;
}

export const search = withoutPersistence(
	(
		state = {
			searchQuery: '',
			items: {},
			selectedResult: -1,
			shouldOpenSelectedResult: false,
			hasAPIResults: false,
		},
		action
	) => {
		switch ( action.type ) {
			case INLINE_HELP_SEARCH_RESET:
				return {
					searchQuery: '',
					items: {
						...state.items,
						'': action.searchResults,
					},
					selectedResult: -1,
					hasAPIResults: false,
				};
			case INLINE_HELP_SET_QUERY_SEARCH:
				return {
					...state,
					searchQuery: action.searchQuery,
				};
			case INLINE_HELP_SEARCH_REQUEST:
				return {
					...state,
					searchQuery: action.searchQuery,
				};
			case INLINE_HELP_SEARCH_REQUEST_SUCCESS:
				return {
					...state,
					selectedResult: -1,
					items: {
						...state.items,
						[ action.searchQuery ]: action.searchResults,
					},
				};
			case INLINE_HELP_SEARCH_REQUEST_API_RESULTS:
				return {
					...state,
					hasAPIResults: action.hasAPIResults,
				};
			case INLINE_HELP_SELECT_RESULT:
				return {
					...state,
					selectedResult: action.resultIndex,
				};
			case INLINE_HELP_SELECT_NEXT_RESULT: {
				if ( state.items[ state.searchQuery ] && state.items[ state.searchQuery ].length ) {
					return {
						...state,
						selectedResult: ( state.selectedResult + 1 ) % state.items[ state.searchQuery ].length,
					};
				}

				return {
					...state,
					selectedResult: -1,
				};
			}
			case INLINE_HELP_SELECT_PREVIOUS_RESULT: {
				if ( state.items[ state.searchQuery ] && state.items[ state.searchQuery ].length ) {
					const newResult = ( state.selectedResult - 1 ) % state.items[ state.searchQuery ].length;
					return {
						...state,
						selectedResult: newResult < 0 ? state.items[ state.searchQuery ].length - 1 : newResult,
					};
				}

				return {
					...state,
					selectedResult: -1,
				};
			}
		}

		return state;
	}
);

const searchResults = combineReducers( { requesting, search } );

export const contactForm = withoutPersistence(
	(
		state = {
			isShowingQandASuggestions: false,
		},
		action
	) => {
		switch ( action.type ) {
			case INLINE_HELP_CONTACT_FORM_RESET:
				return {
					...state,
					isShowingQandASuggestions: false,
				};
			case INLINE_HELP_CONTACT_FORM_SHOW_QANDA:
				return {
					...state,
					isShowingQandASuggestions: true,
				};
		}

		return state;
	}
);

const combinedReducer = combineReducers( {
	ui,
	popover,
	contactForm,
	searchResults,
} );

export default withStorageKey( 'inlineHelp', combinedReducer );
