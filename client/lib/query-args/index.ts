import page from '@automattic/calypso-router';
import { getQueryArgs as wpGetQueryArgs } from '@wordpress/url';

function getRelativeUrlWithParameters(
	queryArgs: object,
	clearExistingParameters = false
): string {
	const url = new URL( window.location.href );

	if ( clearExistingParameters ) {
		url.searchParams.forEach( ( value, key ) => url.searchParams.delete( key ) );
	}

	for ( const [ key, value ] of Object.entries( queryArgs ) ) {
		url.searchParams.set( key, value );
	}

	return url.pathname + url.search + url.hash;
}

/**
 * Sets URL parameters, removing the existing ones
 * 1. {
 *     uri: 'https://wordpress.com/reader/search',
 *     queryArgs: '{ q: "reader is super awesome" }'
 *    } --> '/reader/search?q=reader+is+super+awesome'
 * 2. {
 *     uri: 'https://wordpress.com/reader/search?s=seo',
 *     queryArgs: '{ c: "category" }'
 *    } --> '/reader/search?c=category'
 * 3. {
 *     uri: 'https://wordpress.com/reader/search?s=seo',
 *     queryArgs: '{}'
 *    } --> '/reader/search'
 * @param queryArgs search object
 * @param redirect boolean if set to true, the history will be replaced instead of pushed
 * Every object key will be created in the URL
 */
export function setQueryArgs( queryArgs: object, redirect = false ) {
	const searchWithoutBaseURL = getRelativeUrlWithParameters( queryArgs, true );

	if ( redirect ) {
		page.redirect( searchWithoutBaseURL );
	} else {
		page( searchWithoutBaseURL );
	}
}

/**
 * Adds or Updates URL parameters, maitaining the existing ones
 * 1. {
 *     uri: 'https://wordpress.com/reader/search',
 *     queryArgs: '{ q: "reader is super awesome" }'
 *    } --> '/reader/search?q=reader+is+super+awesome'
 * 2. {
 *     uri: 'https://wordpress.com/reader/search',
 *     queryArgs: '{ s: seo, c: "category" }'
 *    } --> '/reader/search?s=seo&c=category'
 * @param queryArgs search object
 * Every object key found in the URL will be replaced
 */
export function updateQueryArgs( queryArgs: object ) {
	const searchWithoutBaseURL = getRelativeUrlWithParameters( queryArgs );

	page( searchWithoutBaseURL );
}

/**
 * Get query args from a URL
 * @returns object Object containing query args or empty object if doesn't have any
 * 1. { uri: 'https://wordpress.com/plugins?s=hello' } --> { s: 'hello' }
 * 2. { uri: 'https://wordpress.com/plugins?s=seo&c=category' } --> { s: 'seo', c: 'category' }
 */
export function getQueryArgs() {
	return wpGetQueryArgs( window.location.href );
}
