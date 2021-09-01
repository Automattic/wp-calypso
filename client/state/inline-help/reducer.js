import { withStorageKey } from '@automattic/state-utils';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
	INLINE_HELP_SET_SEARCH_QUERY,
	INLINE_HELP_CONTACT_FORM_RESET,
	INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_SEARCH_RESET,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const popover = ( state = { isVisible: false }, action ) => {
	switch ( action.type ) {
		case INLINE_HELP_POPOVER_SHOW:
			return { ...state, isVisible: true };
		case INLINE_HELP_POPOVER_HIDE:
			return { ...state, isVisible: false };
	}

	return state;
};

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

export const search = (
	state = {
		searchQuery: '',
		items: {},
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
	}

	return state;
};

const searchResults = combineReducers( { requesting, search } );

export const contactForm = (
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
};

const combinedReducer = combineReducers( {
	popover,
	contactForm,
	searchResults,
} );

export default withStorageKey( 'inlineHelp', combinedReducer );
