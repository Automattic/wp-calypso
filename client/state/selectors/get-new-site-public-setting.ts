/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { shouldNewSiteBePrivateByDefault } from './should-new-site-be-private-by-default';

const debug = debugFactory( 'calypso:signup:private-by-default' );

/**
 * Get the numeric value that should be provided to the "new site" endpoint
 * @param state The current client state
 * @param siteType The selected site type / segment. Corresponds with the `slug` in ./site-type.js
 * @returns `-1` for private by default & `1` for public
 */
export function getNewSitePublicSetting( state, siteType: string = '' ): number {
	debug( 'getNewSitePublicSetting input', { siteType } );

	return shouldNewSiteBePrivateByDefault( state, siteType ) ? -1 : 1;
}
