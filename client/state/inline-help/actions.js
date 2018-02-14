/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

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
	INLINE_HELP_SELECT_NEXT_CONTEXT_LINK,
	INLINE_HELP_SELECT_PREVIOUS_CONTEXT_LINK,
	INLINE_HELP_CONTEXT_LINK_REQUEST,
	INLINE_HELP_CONTEXT_LINK_REQUEST_SUCCESS,
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

function getDefaultContextLinks() {
	// copied from client/me/help/main for now
	const contextLinks = [
		{
			link: 'https://en.support.wordpress.com/com-vs-org/',
			title: translate( 'Uploading custom plugins and themes' ),
			description: translate( 'Learn more about installing a custom theme or plugin using the Business plan.' ),
		},
		{
			link: 'https://en.support.wordpress.com/all-about-domains/',
			title: translate( 'All About Domains' ),
			description: translate( 'Set up your domain whether it’s registered with WordPress.com or elsewhere.' ),
		},
		{
			link: 'https://en.support.wordpress.com/start/',
			title: translate( 'Get Started' ),
			description: translate( 'No matter what kind of site you want to build, ' +
				'our five-step checklists will get you set up and ready to publish.' ),
		},
		{
			link: 'https://en.support.wordpress.com/settings/privacy-settings/',
			title: translate( 'Privacy Settings' ),
			description: translate( 'Limit your site’s visibility or make it completely private.' ),
		},
	];
	return contextLinks;
}

/**
 * Triggers a network request to fetch context links for the provided context.
 *
 * @param  {Object}  context Context object
 * @return {Function}        Action thunk
 */
export function requestInlineHelpContextLinks() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_CONTEXT_LINK_REQUEST,
		} );
		dispatch( {
			type: INLINE_HELP_CONTEXT_LINK_REQUEST_SUCCESS,
			items: getDefaultContextLinks(),
		} );
	};
}

/**
 * Selects the next result in the inline help results list.
 *
 * @return {Function}        Action thunk
 */
export function selectNextContextLink() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SELECT_NEXT_CONTEXT_LINK,
		} );
	};
}

/**
 * Selects the previous result in the inline help results list.
 *
 * @return {Function}        Action thunk
 */
export function selectPreviousContextLink() {
	return dispatch => {
		dispatch( {
			type: INLINE_HELP_SELECT_PREVIOUS_CONTEXT_LINK,
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
