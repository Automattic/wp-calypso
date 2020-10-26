/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence, withStorageKey } from 'calypso/state/utils';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
	INLINE_HELP_SELECT_RESULT,
	INLINE_HELP_SET_SEARCH_QUERY,
	INLINE_HELP_CONTACT_FORM_RESET,
	INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_SHOW,
	INLINE_HELP_HIDE,
	INLINE_HELP_SEARCH_RESET,
} from 'calypso/state/action-types';

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
			case INLINE_HELP_SET_SEARCH_QUERY:
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
