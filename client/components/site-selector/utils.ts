import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import type { UserData } from 'calypso/lib/user/user';

type SiteCountKey = 'site_count' | 'visible_site_count';

const prependKeyForJetpackCloud = < K extends SiteCountKey >( key: K ): `jetpack_${ K }` =>
	`jetpack_${ key }`;

const chooseKeyForPlatform = < K extends SiteCountKey >( key: K ): K | `jetpack_${ K }` =>
	isJetpackCloud() ? prependKeyForJetpackCloud( key ) : key;

/**
 * Returns the number of sites of the current user, for the platform being
 * visited (e.g. Calypso, or Jetpack cloud)
 * @param {UserData} user Authenticated user
 * @returns {number} Site count
 */
export function getUserSiteCountForPlatform( user: UserData ): number {
	return user?.[ chooseKeyForPlatform( 'site_count' ) ] ?? 0;
}

/**
 * Returns the number of visible sites of the current user, for the platform being
 * visited (e.g. Calypso, or Jetpack cloud)
 * @param {UserData} user Authenticated user
 * @returns {number} Visible site count
 */
export function getUserVisibleSiteCountForPlatform( user: UserData ): number {
	return user?.[ chooseKeyForPlatform( 'visible_site_count' ) ] ?? 0;
}
