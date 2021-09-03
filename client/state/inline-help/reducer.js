import { withStorageKey } from '@automattic/state-utils';
import {
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

export const search = (
	state = {
		searchQuery: '',
	},
	action
) => {
	switch ( action.type ) {
		case INLINE_HELP_SEARCH_RESET:
			return {
				searchQuery: '',
			};
		case INLINE_HELP_SET_SEARCH_QUERY:
			return {
				...state,
				searchQuery: action.searchQuery,
			};
	}

	return state;
};

const searchResults = combineReducers( { search } );

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
