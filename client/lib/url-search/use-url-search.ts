import { addQueryArgs } from '@wordpress/url';
import debugFactory from 'debug';
import page from 'page';
import { useState } from 'react';
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
 * @param {string} uri the uri to modify and add a query to
 * @param {string} search the search term
 * @param {string} [queryKey = s] the key to place in the url.  defaults to s
 * @returns {string} The built search url
 */
function buildSearchUrl( uri: string, search: string, queryKey = 's' ): string {
	const parsedUrl = new URL( uri );

	if ( search ) {
		const baseUrl = uri.replace( parsedUrl.origin, '' );
		const query = addQueryArgs( baseUrl, { [ queryKey ]: search } );
		return query.replace( /%20/g, '+' );
	}

	return parsedUrl.pathname;
}

function useUrlSearch( queryKey = 's' ) {
	const [ isSearchOpen, setSearchOpen ] = useState( false );
	const [ searchTerm, setSearchTerm ] = useState( '' );

	function doSearch( query: string ) {
		setSearchTerm( query );
		setSearchOpen( '' !== query );

		const searchURL = buildSearchUrl( window.location.href, query, queryKey );

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
		return isSearchOpen || !! queryKey;
	}

	return {
		doSearch,
		getSearchOpen,
		searchTerm,
	};
}

export default useUrlSearch;
