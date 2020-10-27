/**
 * A legacy route is a path that Calypso should ignore, allowing the browser
 * to reload the page.
 */

/**
 * External dependencies
 */
import { URL as URLString } from 'calypso/types';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';

interface LegacyRoute {
	match: RegExp;
	noMatch?: RegExp;
	predicate?: ( path: URLString ) => boolean;
}

const legacyRoutes: LegacyRoute[] = [
	{ match: /.php$/ },
	{ match: /^\/?$/, predicate: () => ! isEnabled( 'reader' ) },
	{ match: /^\/manage/ },
	{ match: /^\/plans/ },
	{
		match: /^\/me/,
		noMatch: /^\/me\/(billing|next)/,
		predicate: () => ! isEnabled( 'me/my-profile' ),
	},
];

/**
 * Determines if a path is a legacy route, and should be ignored by Calypso
 *
 * @param path The path to check
 * @returns True if legacy path, false otherwise
 */
export function isLegacyRoute( path: URLString ): boolean {
	return legacyRoutes.some(
		( { match, noMatch = { test: () => false }, predicate = () => true } ) =>
			predicate( path ) && match.test( path ) && ! noMatch.test( path )
	);
}
