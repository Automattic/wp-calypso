import { get } from 'lodash';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import type { UserData } from 'calypso/lib/user/user';

const prependKeyForJetpackCloud = ( key: string ): string => `jetpack_${ key }`;

const chooseKeyForPlatform = ( key: string ): string =>
	isJetpackCloud() ? prependKeyForJetpackCloud( key ) : key;

/**
 * Returns the number of sites of the current user, for the platform being
 * visited (e.g. Calypso, or Jetpack cloud)
 * @param {UserData} user Authenticated user
 * @returns {number} Site count
 */
export function getUserSiteCountForPlatform( user: UserData ): number {
	return get( user, chooseKeyForPlatform( 'site_count' ), 0 );
}

/**
 * Returns the number of visible sites of the current user, for the platform being
 * visited (e.g. Calypso, or Jetpack cloud)
 * @param {UserData} user Authenticated user
 * @returns {number} Visible site count
 */
export function getUserVisibleSiteCountForPlatform( user: UserData ): number {
	return get( user, chooseKeyForPlatform( 'visible_site_count' ), 0 );
}
