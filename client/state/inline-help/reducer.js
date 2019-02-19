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
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_CHECKLIST_PROMPT_SHOW,
	INLINE_HELP_CHECKLIST_PROMPT_HIDE,
	INLINE_HELP_ONBOARDING_WELCOME_PROMPT_SHOW,
	INLINE_HELP_ONBOARDING_WELCOME_PROMPT_HIDE,
	INLINE_HELP_CHECKLIST_PROMPT_SET_TASK_ID,
	INLINE_HELP_CHECKLIST_PROMPT_SET_STEP,
	SERIALIZE,
} from 'state/action-types';

export const popover = createReducer(
	{
		isVisible: false,
	},
	{
		[ INLINE_HELP_POPOVER_SHOW ]: state => ( { ...state, isVisible: true } ),
		[ INLINE_HELP_POPOVER_HIDE ]: state => ( { ...state, isVisible: false } ),
	}
);

export const checklistPrompt = createReducer(
	{
		isVisible: false,
		taskId: null,
		step: 0,
	},
	{
		[ INLINE_HELP_CHECKLIST_PROMPT_SHOW ]: state => ( { ...state, isVisible: true } ),
		[ INLINE_HELP_CHECKLIST_PROMPT_HIDE ]: state => ( {
			...state,
			isVisible: false,
			taskId: null,
			step: 0,
		} ),
		[ INLINE_HELP_CHECKLIST_PROMPT_SET_TASK_ID ]: ( state, { taskId } ) => ( { ...state, taskId } ),
		[ INLINE_HELP_CHECKLIST_PROMPT_SET_STEP ]: ( state, { step } ) => ( { ...state, step } ),
		[ SERIALIZE ]: state => state,
	}
);

export const onboardingWelcomePrompt = createReducer(
	{
		isVisible: false,
	},
	{
		[ INLINE_HELP_ONBOARDING_WELCOME_PROMPT_SHOW ]: state => ( { ...state, isVisible: true } ),
		[ INLINE_HELP_ONBOARDING_WELCOME_PROMPT_HIDE ]: state => ( { ...state, isVisible: false } ),
	}
);

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case INLINE_HELP_SEARCH_REQUEST:
			return {
				...state,
				[ action.searchQuery ]: true,
			};
		case INLINE_HELP_SEARCH_REQUEST_SUCCESS:
		case INLINE_HELP_SEARCH_REQUEST_FAILURE:
			return {
				...state,
				[ action.searchQuery ]: false,
			};
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
		[ INLINE_HELP_SEARCH_REQUEST ]: ( state, action ) => ( {
			...state,
			searchQuery: action.searchQuery,
		} ),
		[ INLINE_HELP_SEARCH_REQUEST_SUCCESS ]: ( state, action ) => ( {
			...state,
			selectedResult: -1,
			items: {
				...state.items,
				[ action.searchQuery ]: action.searchResults,
			},
		} ),
		[ INLINE_HELP_SELECT_RESULT ]: ( state, action ) => ( {
			...state,
			selectedResult: action.resultIndex,
		} ),
		[ INLINE_HELP_SELECT_NEXT_RESULT ]: state => {
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
		},
		[ INLINE_HELP_SELECT_PREVIOUS_RESULT ]: state => {
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
		},
	}
);

const searchResults = combineReducers( { requesting, search } );

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

export default combineReducers( {
	popover,
	checklistPrompt,
	onboardingWelcomePrompt,
	contactForm,
	searchResults,
} );
