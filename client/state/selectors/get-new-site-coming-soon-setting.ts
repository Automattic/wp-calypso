/**
 * Internal dependencies
 */
import shouldNewSiteBePrivateByDefault from './should-new-site-be-private-by-default';
import config from 'config';

/**
 * Get the numeric value that should be provided to the "new site" endpoint
 *
 * @param state The current client state
 * @returns `-1` for private by default & `1` for public
 */
export default function getNewSiteComingSoonSetting( state: object ): number {
	return shouldNewSiteBePrivateByDefault( state ) ? 1 : 0;
}

export function getNewSiteComingSoonSettingV2(): number {
	return config.isEnabled( 'coming-soon-v2' ) ? 1 : 0;
}
