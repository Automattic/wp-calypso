import { useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
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
 * @param {object} options the options object
 * @param {string} options.uri the uri to modify and add a query to
 * @param {string} options.search the search term
 * @param {string} [options.queryKey = s] the key to place in the url.  defaults to s
 * @returns {string} The built search url
 */
export const buildSearchUrl = ( {
	uri,
	search,
	queryKey = 's',
}: {
	uri: string;
	search: string;
	queryKey?: string;
} ) => {
	const parsedUrl = new URL( uri );

	if ( search ) {
		const baseUrl = uri.replace( parsedUrl.origin, '' );
		const query = addQueryArgs( baseUrl, { [ queryKey ]: search } );
		return query.replace( /%20/g, '+' );
	}

	return parsedUrl.pathname;
};

function useUrlSearch( queryKey = 's' ) {
	const [ isSearchOpen, setSearchOpen ] = useState( false );

	function doSearch( query: string ) {
		setSearchOpen( '' !== query );

		const searchURL = buildSearchUrl( {
			uri: window.location.href,
			search: query,
			queryKey: queryKey,
		} );

		debug( 'search for: %s', query );
		if ( queryKey && query ) {
			debug( 'replacing URL: %s', searchURL );
			page.replace( searchURL );
		} else {
			debug( 'setting URL: %s', searchURL );
			page( searchURL );
		}
	}

	function getSearchOpen() {
		return isSearchOpen !== false || !! queryKey;
	}

	return {
		doSearch: doSearch,
		getSearchOpen: getSearchOpen,
	};
}

export default useUrlSearch;
