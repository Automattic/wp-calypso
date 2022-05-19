import { getQueryArgs } from '@wordpress/url';
import page from 'page';

function getRelativeUrlWithParameters( queryArgs: object ): string {
	const urlParams = new URLSearchParams( window.location.search );
	let returnPath = window.location.pathname;

	if ( queryArgs ) {
		for ( const [ key, value ] of Object.entries( queryArgs ) ) {
			if ( '' !== value ) {
				urlParams.set( key, value );
			} else {
				urlParams.delete( key );
			}
		}

		returnPath += '?' + urlParams.toString();
	}

	return returnPath;
}

function useQueryArgs() {
	function setQueryArgs( queryArgs: object ) {
		const searchWithoutBaseURL = getRelativeUrlWithParameters( queryArgs );

		page.replace( searchWithoutBaseURL );
	}

	return {
		/**
		 * Adds or updates the URL parameters
		 * 1. {
		 *     uri: 'https://wordpress.com/read/search?q=reader+is+awesome',
		 *     queryArgs: '{ q: "reader is super awesome" }'
		 *    } --> '/read/search?q=reader+is+super+awesome'
		 * 2. {
		 *     uri: 'https://wordpress.com/read/search',
		 *     queryArgs: '{ s: seo, c: "category" }'
		 *    } --> '/read/search?s=seo&c=category'
		 *
		 * @param queryArgs search string or search object
		 * If a string is provided on queryArgs, the default search key 's' will be used
		 * If an object is provided, every object key found in the URL will be replaced
		 */
		setQueryArgs,

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

export default useQueryArgs;
