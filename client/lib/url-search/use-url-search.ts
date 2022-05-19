import { getQueryArgs } from '@wordpress/url';
import debugFactory from 'debug';
import page from 'page';
import { useState } from 'react';
const debug = debugFactory( 'calypso:url-search' );

function buildSearchUrl( defaultSearchKey: string, querySearch: string | object ): string {
	const urlSearch = new URLSearchParams( window.location.search );
	let returnPath = window.location.pathname;

	if ( querySearch ) {
		if ( typeof querySearch === 'string' ) {
			urlSearch.set( defaultSearchKey, querySearch );
		} else {
			for ( const [ key, value ] of Object.entries( querySearch ) ) {
				urlSearch.set( key, value );
			}
		}

		returnPath += '?' + urlSearch.toString();
	}

	return returnPath;
}

function useUrlSearch() {
	const [ isSearchOpen, setSearchOpen ] = useState( false );

	function doSearch( querySearch: string | object ) {
		setSearchOpen( '' !== querySearch );
		debug( 'search for: %s', querySearch );

		const defaultSearchKey = 's';
		const searchWithoutBaseURL = buildSearchUrl( defaultSearchKey, querySearch );

		debug( 'setting URL: %s', searchWithoutBaseURL );
		page.replace( searchWithoutBaseURL );
	}

	function getSearchOpen() {
		return isSearchOpen;
	}

	return {
		/**
		 * Return true if the last querySearch has anything different from empty string
		 */
		getSearchOpen,

		/**
		 * Performs URL search by adding or replacing terms in the URL
		 * 1. { uri: 'https://wordpress.com/plugins', querySearch:'hello' } --> '/plugins?s=hello'
		 * 2. {
		 *     uri: 'https://wordpress.com/read/search?q=reader+is+awesome',
		 *     querySearch: '{ q: "reader is super awesome" }'
		 *    } --> '/read/search?q=reader+is+super+awesome'
		 * 3. {
		 *     uri: 'https://wordpress.com/read/search',
		 *     querySearch: '{ s: seo, c: "category" }'
		 *    } --> '/read/search?s=seo&c=category'
		 *
		 * @param querySearch search string or search object
		 * If a string is provided on querySearch, the default search key 's' will be used
		 * If an object is provided, every object key found in the URL will be replaced
		 */
		doSearch,

		/**
		 * Get query args from a URL
		 *
		 * @returns object Object containing query args or empty object if doesn't have any
		 * 1. { uri: 'https://wordpress.com/plugins?s=hello' } --> { s: 'hello' }
		 * 2. { uri: 'https://wordpress.com/plugins?s=seo&c=category' } --> { s: 'seo', c: 'category' }
		 */
		getQueryArgs: () => getQueryArgs( window.location.href ),
	};
}

export default useUrlSearch;
