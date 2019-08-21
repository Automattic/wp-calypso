/**
 * Internal dependencies
 */
import shouldNewSiteBePrivateByDefault from './should-new-site-be-private-by-default';

/**
 * Get the numeric value that should be provided to the "new site" endpoint
 * @param state The current client state
 * @returns `-1` for private by default & `1` for public
 */
export default function getNewSitePublicSetting( state: object ): number {
	return shouldNewSiteBePrivateByDefault( state ) ? -1 : 1;
}
