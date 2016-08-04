/**
 * A legacy route is a path that Calypso should ignore, allowing the browser
 * to reload the page.
 */

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * Determines if a path is a legacy route, and should be ignored by Calypso
 *
 * @param {any} path      The path to check
 * @param {any} isEnabled For stubbing
 * @returns {boolean} True if legacy path, false otherwise
 */
export function isLegacyRoute( path ) {
	return ( /.php$/.test( path ) ||
		/^\/?$/.test( path ) && ! config.isEnabled( 'reader' ) ||
		/^\/my-stats/.test( path ) ||
		/^\/notifications/.test( path ) ||
		/^\/themes/.test( path ) ||
		/^\/manage/.test( path ) ||
		/^\/plans/.test( path ) && ! config.isEnabled( 'manage/plans' ) ||
		/^\/me/.test( path ) && ! /^\/me\/billing/.test( path ) &&
		! /^\/me\/next/.test( path ) && ! config.isEnabled( 'me/my-profile' ) );
}
