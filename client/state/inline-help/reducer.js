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
	INLINE_HELP_OPEN_SELECTED_RESULT,
	INLINE_HELP_OPEN_SELECTED_CONTEXT_LINK,
	INLINE_HELP_DID_OPEN_CONTEXT_LINK,
	INLINE_HELP_DID_OPEN_SELECTED_RESULT,
	INLINE_HELP_CONTEXT_LINK_REQUEST,
	INLINE_HELP_CONTEXT_LINK_REQUEST_SUCCESS,
	INLINE_HELP_CONTEXT_LINK_REQUEST_FAILURE,
	INLINE_HELP_SELECT_NEXT_CONTEXT_LINK,
	INLINE_HELP_SELECT_PREVIOUS_CONTEXT_LINK,
	ROUTE_SET,
} from 'state/action-types';

export const search = createReducer(
	{
		searchQuery: '',
		items: {},
		requesting: {},
		selectedResult: -1,
		shouldOpenSelectedResult: false,
	},
	{
		[ INLINE_HELP_SEARCH_REQUEST ]: ( state, action ) => {
			return Object.assign( {}, state, {
				requesting: {
					...state.requesting,
					[ action.searchQuery ]: true,
				},
				searchQuery: action.searchQuery,
			} );
		},
		[ INLINE_HELP_SEARCH_REQUEST_SUCCESS ]: ( state, action ) => {
			return Object.assign( {}, state, {
				items: {
					...state.items,
					[ action.searchQuery ]: action.searchResults,
				},
				requesting: {
					...state.requesting,
					[ action.searchQuery ]: false,
				},
				selectedResult: -1,
			} );
		},
		[ INLINE_HELP_SEARCH_REQUEST_FAILURE ]: ( state, action ) => {
			return Object.assign( {}, state, {
				items: {
					...state.items,
					[ action.searchQuery ]: null,
				},
				requesting: {
					...state.requesting,
					[ action.searchQuery ]: false,
				},
				selectedResult: -1,
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
		[ INLINE_HELP_OPEN_SELECTED_RESULT ]: state => {
			return Object.assign( {}, state, {
				shouldOpenSelectedResult: true,
			} );
		},
		[ INLINE_HELP_DID_OPEN_SELECTED_RESULT ]: state => {
			return Object.assign( {}, state, {
				shouldOpenSelectedResult: false,
			} );
		},
	}
);

export const contextLinks = createReducer(
	{
		context: {},
		items: {},
		requesting: {},
		selectedContextLink: -1,
		shouldOpenSelectedContextLink: false,
	},
	{
		[ INLINE_HELP_CONTEXT_LINK_REQUEST ]: ( state ) => {
			return Object.assign( {}, state, {
				requesting: {
					...state.requesting,
					[ state.context.url ]: true,
				},
				context: state.context,
			} );
		},
		[ INLINE_HELP_CONTEXT_LINK_REQUEST_SUCCESS ]: ( state, action ) => {
			return Object.assign( {}, state, {
				items: {
					...state.items,
					[ state.context.url ]: action.items,
				},
				requesting: {
					...state.requesting,
					[ state.context.url ]: false,
				},
				selectedResult: -1,
			} );
		},
		[ INLINE_HELP_CONTEXT_LINK_REQUEST_FAILURE ]: ( state ) => {
			return Object.assign( {}, state, {
				items: {
					...state.items,
					[ state.context.url ]: null,
				},
				requesting: {
					...state.requesting,
					[ state.context.url ]: false,
				},
				selectedResult: -1,
			} );
		},
		[ ROUTE_SET ]: ( state, action ) => {
			return Object.assign( {}, state, {
				context: {
					...state.context,
					url: action.path,
				},
			} );
		},
		[ INLINE_HELP_SELECT_NEXT_CONTEXT_LINK ]: state => {
			if ( state.items[ state.context.url ] && state.items[ state.context.url ].length ) {
				return Object.assign( {}, state, {
					selectedResult: ( state.selectedResult + 1 ) % state.items[ state.context.url ].length,
				} );
			}
			return Object.assign( {}, state, {
				selectedResult: -1,
			} );
		},
		[ INLINE_HELP_SELECT_PREVIOUS_CONTEXT_LINK ]: state => {
			if ( state.items[ state.context.url ] && state.items[ state.context.url ].length ) {
				const newResult = ( state.selectedResult - 1 ) % state.items[ state.context.url ].length;
				return Object.assign( {}, state, {
					selectedResult: newResult < 0 ? state.items[ state.context.url ].length - 1 : newResult,
				} );
			}
			return Object.assign( {}, state, {
				selectedResult: -1,
			} );
		},
		[ INLINE_HELP_OPEN_SELECTED_CONTEXT_LINK ]: state => {
			return Object.assign( {}, state, {
				shouldOpenSelectedContextLink: true,
			} );
		},
		[ INLINE_HELP_DID_OPEN_CONTEXT_LINK ]: state => {
			return Object.assign( {}, state, {
				shouldOpenSelectedContextLink: false,
			} );
		},
	}
);

export default combineReducers( { search, contextLinks } );
