/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SELECT_NEXT_RESULT,
	INLINE_HELP_SELECT_PREVIOUS_RESULT,
	INLINE_HELP_OPEN_SELECTED_RESULT,
	INLINE_HELP_DID_OPEN_CONTEXT_LINK,
	INLINE_HELP_DID_OPEN_SELECTED_RESULT,
} from 'state/action-types';

/**
 * Triggers a network request to fetch search results for a query string.
 *
 * @param  {?String}  searchQuery Search query
 * @return {Function}        Action thunk
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
 * Selects the next result in the inline help results list.
 *
 * @return {Function}        Action thunk
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
 * @return {Function}        Action thunk
 */
export function selectPreviousResult() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SELECT_PREVIOUS_RESULT,
		} );
	};
}

/**
 * Opens the selected result in the inline help results list.
 *
 * @return {Function}        Action thunk
 */
export function openResult() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_OPEN_SELECTED_RESULT,
		} );
	};
}

/**
 * Opens the selected result in the inline help results list.
 *
 * @return {Function}        Action thunk
 */
export function didOpenResult() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_DID_OPEN_SELECTED_RESULT,
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

/**
 * Opens the selected result in the inline help context links list.
 *
 * @return {Function}        Action thunk
 */
export function didOpenContextLink() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_DID_OPEN_CONTEXT_LINK,
		} );
	};
}
