/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	INLINE_HELP_SEARCH_REQUEST,
	INLINE_HELP_SEARCH_REQUEST_FAILURE,
	INLINE_HELP_SEARCH_REQUEST_SUCCESS,
	INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
	INLINE_HELP_SET_SEARCH_QUERY,
	INLINE_HELP_SELECT_RESULT,
	INLINE_HELP_CONTACT_FORM_RESET,
	INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
	INLINE_HELP_POPOVER_SHOW,
	INLINE_HELP_POPOVER_HIDE,
	INLINE_HELP_SHOW,
	INLINE_HELP_HIDE,
	INLINE_HELP_SEARCH_RESET,
} from 'calypso/state/action-types';

import getContextualHelpResults from 'calypso/state/inline-help/selectors/get-contextual-help-results';
import getAdminHelpResults from 'calypso/state/inline-help/selectors/get-admin-help-results';
import 'calypso/state/inline-help/init';
import {
	SUPPORT_TYPE_API_HELP,
	SUPPORT_TYPE_CONTEXTUAL_HELP,
} from '../../blocks/inline-help/constants';

/**
 * Set the search query in the state tree for the inline help.
 *
 * @param {string} searchQuery - query string to persist.
 * @returns {Function}            Action thunk.
 */
export function setInlineHelpSearchQuery( searchQuery = '' ) {
	return {
		type: INLINE_HELP_SET_SEARCH_QUERY,
		searchQuery,
	};
}

/**
 * Map the collection, populating each result object
 * with the given support type value.
 *
 * @param {Array}   collection   - collection to populate.
 * @param {string}  support_type - Support type to add to each result item.
 * @returns {Array}                Populated collection.
 */
function mapWithSupportTypeProp( collection, support_type ) {
	return collection.map( ( item ) => ( { ...item, support_type } ) );
}

/**
 * Fetches search results for a given query string.
 * Triggers an API request. If this returns no results
 * then hard coded results are returned based on the context of the
 * current route (see `client/blocks/inline-help/contextual-help.js`).
 *
 * @param {string} searchQuery Search query
 * @returns {Function}        Action thunk
 */
export function requestInlineHelpSearchResults( searchQuery = '' ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const contextualResults = mapWithSupportTypeProp(
			getContextualHelpResults( state ),
			SUPPORT_TYPE_CONTEXTUAL_HELP
		);
		const helpAdminResults = getAdminHelpResults( state, searchQuery, 3 );

		// Ensure empty strings are removed as valid searches.
		searchQuery = searchQuery.trim();

		// If the search is empty return contextual results and exist
		// early to avoid unwanted network requests.
		if ( ! searchQuery ) {
			dispatch( {
				type: INLINE_HELP_SEARCH_RESET,
				searchResults: contextualResults,
			} );

			// Exit early
			return;
		}

		dispatch( {
			type: INLINE_HELP_SEARCH_REQUEST,
			searchQuery,
		} );

		wpcom
			.undocumented()
			.getHelpLinks( searchQuery )
			.then( ( { wordpress_support_links: searchResults } ) => {
				// Searches will either:
				//
				// 1. return results from the search API endpoint
				// ...or...
				// 2. return hard-coded results based on the current route.
				//
				// A INLINE_HELP_SEARCH_REQUEST_API_RESULTS action indicates
				// whether the search results came from the API or not. This
				// enables UI to indicate a "no results" status and indicate
				// that the results are contextual (if required).

				const hasAPIResults = !! ( searchResults && searchResults.length );

				dispatch( {
					type: INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
					hasAPIResults,
				} );

				dispatch( {
					type: INLINE_HELP_SEARCH_REQUEST_SUCCESS,
					searchQuery,
					searchResults: hasAPIResults
						? [
								...mapWithSupportTypeProp( searchResults, SUPPORT_TYPE_API_HELP ),
								...helpAdminResults,
						  ]
						: [ ...contextualResults, ...helpAdminResults ],
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: INLINE_HELP_SEARCH_REQUEST_FAILURE,
					searchQuery,
					error,
				} );

				// Force reset flag for no API results
				dispatch( {
					type: INLINE_HELP_SEARCH_REQUEST_API_RESULTS,
					hasAPIResults: false,
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
	return ( dispatch ) => {
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
	return ( dispatch ) => {
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
	return ( dispatch ) => {
		dispatch( {
			type: INLINE_HELP_CONTACT_FORM_SHOW_QANDA,
		} );
	};
}

export function setSearchResults( searchQuery, searchResults ) {
	return ( dispatch ) => {
		dispatch( {
			type: INLINE_HELP_SEARCH_REQUEST_SUCCESS,
			searchQuery,
			searchResults,
		} );
	};
}

export function showInlineHelpPopover() {
	return ( dispatch ) => {
		dispatch( {
			type: INLINE_HELP_POPOVER_SHOW,
		} );
	};
}

export function hideInlineHelpPopover() {
	return ( dispatch ) => {
		dispatch( {
			type: INLINE_HELP_POPOVER_HIDE,
		} );
	};
}

export function showInlineHelp() {
	return ( dispatch ) => {
		dispatch( {
			type: INLINE_HELP_SHOW,
		} );
	};
}

export function hideInlineHelp() {
	return ( dispatch ) => {
		dispatch( {
			type: INLINE_HELP_HIDE,
		} );
	};
}
