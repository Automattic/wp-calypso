/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SELECT_RESULT,
	INLINE_HELP_SELECT_NEXT_RESULT,
	INLINE_HELP_SELECT_PREVIOUS_RESULT,
	INLINE_HELP_CONTACT_FORM_RESET,
	INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_POPOVER_HIDE,
} from 'state/action-types';

/**
 * Triggers a network request to fetch search results for a query string.
 *
 * @param  {?string}  searchQuery Search query
 * @returns {Function}        Action thunk
 */
export function requestInlineHelpSearchResults( searchQuery ) {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SEARCH_REQUEST,
			searchQuery,
		} );

		wpcom
			.undocumented()
			.getHelpLinks( searchQuery )
			.then( ( { wordpress_support_links: searchResults } ) => {
				dispatch( {
					type: INLINE_HELP_SEARCH_REQUEST_SUCCESS,
					searchQuery,
					searchResults,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: INLINE_HELP_SEARCH_REQUEST_FAILURE,
					searchQuery,
					error,
				} );
			} );
	};
}
/**
 * Selects a specific result in the inline help results list.
 *
 * @param  {number}  resultIndex Index of the result to select
 * @returns {Function}        Action thunk
 */
export function selectResult( resultIndex ) {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SELECT_RESULT,
			resultIndex,
		} );
	};
}

/**
 * Resets the inline contact form state.
 *
 * @returns {Function}  Action thunk
 */
export function resetInlineHelpContactForm() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_CONTACT_FORM_RESET,
		} );
	};
}

/**
 * Shows the Q&A suggestions on the contact form.
 *
 * @returns {Function}  Action thunk
 */
export function showQandAOnInlineHelpContactForm() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
		} );
	};
}

/**
 * Selects the next result in the inline help results list.
 *
 * @returns {Function}        Action thunk
 */
export function selectNextResult() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SELECT_NEXT_RESULT,
		} );
	};
}

/**
 * Selects the previous result in the inline help results list.
 *
 * @returns {Function}        Action thunk
 */
export function selectPreviousResult() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SELECT_PREVIOUS_RESULT,
		} );
	};
}

export function setSearchResults( searchQuery, searchResults ) {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SEARCH_REQUEST_SUCCESS,
			searchQuery,
			searchResults,
		} );
	};
}

export function showInlineHelpPopover() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_POPOVER_SHOW,
		} );
	};
}

export function hideInlineHelpPopover() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_POPOVER_HIDE,
		} );
	};
}
