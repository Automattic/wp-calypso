import type { Page } from '@playwright/test';

/**
 * Non-essential chunks a content blocker may block (the cookie banner matched
 * "EasyList - Cookie Notices"). Their `AsyncLoad` call sites pass
 * `loadFailureFallback`, so a blocked chunk must leave the page usable.
 */
export const COOKIE_BANNER_CHUNK = {
	name: 'cookie banner',
	pattern: /\/async-load-calypso-blocks-privacy-prefs\.[^/]*\.(js|css)(\?|$)/,
};

export const GLOBAL_NOTICES_CHUNK = {
	name: 'global notices',
	pattern: /\/async-load-calypso-components-global-notices\.[^/]*\.(js|css)(\?|$)/,
};

/**
 * Aborts every request matching `pattern` the way a content blocker would, and
 * records uncaught page errors.
 *
 * Assert on `wasJsBlocked()` so a renamed chunk fails the test instead of
 * passing it silently.
 */
export async function blockChunk( page: Page, pattern: RegExp ) {
	const blockedUrls: string[] = [];
	const pageErrors: Error[] = [];

	await page.route( pattern, ( route ) => {
		blockedUrls.push( route.request().url() );
		return route.abort( 'blockedbyclient' );
	} );
	page.on( 'pageerror', ( error ) => pageErrors.push( error ) );

	return {
		wasJsBlocked: () => blockedUrls.some( ( url ) => /\.js(\?|$)/.test( url ) ),
		pageErrorMessages: () => pageErrors.map( ( error ) => error.message ),
	};
}
