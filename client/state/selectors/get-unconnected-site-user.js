/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import sha1 from 'hash.js/lib/hash/sha/1';

/**
 * Internal dependencies
 */
import { getUnconnectedSite } from 'state/selectors';

/**
 * Returns a hashed userEmail of a Jetpack onboarding site indexed by the siteID.
 * Returns null if no email has been provided.
 *
 * @param  {Object}   state     Global state tree.
 * @param  {String}   siteId  	SiteId of the unconnected site.
 * @return {String}|null        Hashed userEmail of the unconnected site.
 */
export default function getUnconnectedSiteUser( state, siteId ) {
	const site = getUnconnectedSite( state, siteId );
	let userIdHashed = null;
	if ( site ) {
		const userId = get( site, 'userEmail', null );
		if ( userId ) {
			const hash = sha1();
			hash.update( userId );
			userIdHashed = hash.digest( 'hex' );
		}
	}
	return userIdHashed;
}
