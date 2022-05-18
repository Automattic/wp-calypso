import { getQueryArgs } from '@wordpress/url';
import debugFactory from 'debug';
import page from 'page';
const debug = debugFactory( 'calypso:url-search' );

/**
 * Function for constructing the url to page to. Here are some examples:
 * 1. { uri: 'https://wordpress.com/plugins', search:'hello' } --> '/plugins?s=hello'
 * 2. {
 *     uri: 'https://wordpress.com/read/search?q=reader+is+awesome',
 *     search: 'reader is super awesome'
 *     queryKey: 'q',
 *    } --> '/read/search?q=reader+is+super+awesome'
 *
 * @param {string} defaultSearchKey Default search key to add search string to
 * @param {string | object} querySearch search string or search object
 * If a string is provided on querySearch, the default search key 's' will be used
 * If an object is provided, every object key found in the URL will be replaced.
 * @returns {string} The built search url
 */
function buildSearchUrl( defaultSearchKey: string, querySearch: string | object ): string {
	const urlSearch = new URLSearchParams( window.location.search );

	if ( typeof querySearch === 'string' ) {
		urlSearch.set( defaultSearchKey, querySearch );
	} else {
		for ( const [ key, value ] of Object.entries( querySearch ) ) {
			urlSearch.set( key, value );
		}
	}

	return window.location.pathname + '?' + urlSearch.toString();
}

function useUrlSearch() {
	/**
	 * Performs URL search by adding or replacing terms in the URL
	 *
	 * @param querySearch search string or search object
	 * If a string is provided on querySearch, the default search key 's' will be used
	 * If an object is provided, every object key found in the URL will be replaced
	 */
	function doSearch( querySearch: string | object ) {
		debug( 'search for: %s', querySearch );

		const defaultSearchKey = 's';
		const searchWithoutBaseURL = buildSearchUrl( defaultSearchKey, querySearch );

		debug( 'setting URL: %s', searchWithoutBaseURL );
		page.replace( searchWithoutBaseURL );
	}

	return {
		doSearch,
		getQueryArgs: () => getQueryArgs( window.location.href ),
	};
}

export default useUrlSearch;
