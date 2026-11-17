import { FiltersEngine } from '@ghostery/adblocker-playwright';
import type { APIRequestContext } from '@playwright/test';

/**
 * The lists uBlock Origin, AdGuard and Brave enable by default or offer one click
 * away. EasyList Cookie is the one that blocked the cookie banner chunk and
 * blanked logged-out onboarding (DOTOBRD-569).
 */
export const FILTER_LISTS = [
	'https://easylist.to/easylist/easylist.txt',
	'https://easylist.to/easylist/easyprivacy.txt',
	'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt',
	'https://secure.fanboy.co.nz/fanboy-annoyance.txt',
	'https://ublockorigin.github.io/uAssets/filters/filters.txt',
	'https://ublockorigin.github.io/uAssets/filters/privacy.txt',
	'https://filters.adtidy.org/extension/ublock/filters/2_without_easylist.txt',
	'https://filters.adtidy.org/extension/ublock/filters/3.txt',
	'https://filters.adtidy.org/extension/ublock/filters/14.txt',
];

/**
 * A cookie-banner script on a neutral domain, matched by the same kind of EasyList
 * Cookie rule that blocked Calypso's chunk. If the lists stop blocking it, a check
 * built on them would pass for the wrong reason.
 */
export const KNOWN_BLOCKED_URL = 'https://example.com/cookie-banner.js';

export interface ContentBlocker {
	blocker: FiltersEngine;
	/** Each list's title and version, in `FILTER_LISTS` order, from the copy this run used. */
	versions: string[];
}

function describeList( url: string, text: string ): string {
	const header = text.slice( 0, 2_000 );
	const field = ( name: string ) =>
		new RegExp( `^! ${ name }: (.+)$`, 'm' ).exec( header )?.[ 1 ].trim();
	const version = field( 'Version' ) ?? field( 'TimeUpdated' ) ?? field( 'Last modified' );
	return `${ field( 'Title' ) ?? url } ${ version ?? '(unversioned)' }`;
}

/**
 * Builds a blocker from `FILTER_LISTS`, downloading each list through Playwright's
 * request context rather than Node's `fetch`. Node's undici crashes the whole worker
 * with an uncatchable `assert(!this.paused)` when a server closes the socket while a
 * large body is still being drained (nodejs/undici#5360), which these multi-megabyte
 * lists hit now and then.
 *
 * A download fails on an error response, which `fromLists` would otherwise parse as
 * filters, and on a stalled connection, including while reading the body. `fromLists`
 * retries a rejected fetch.
 *
 * @param request Playwright request context.
 * @param config  Engine options, e.g. `{ debug: true }` to keep each filter's raw line.
 */
export async function loadContentBlocker(
	request: APIRequestContext,
	config: Parameters< typeof FiltersEngine.fromLists >[ 2 ] = {}
): Promise< ContentBlocker > {
	const versions = new Map< string, string >();
	const fetchList = async ( url: string ) => {
		const response = await request.get( url, { timeout: 20_000 } );
		if ( ! response.ok() ) {
			throw new Error( `${ url } responded ${ response.status() }` );
		}
		const text = await response.text();
		versions.set( url, describeList( url, text ) );
		return new Response( text );
	};
	const blocker = await FiltersEngine.fromLists( fetchList, FILTER_LISTS, config );
	return { blocker, versions: FILTER_LISTS.map( ( url ) => versions.get( url ) as string ) };
}
