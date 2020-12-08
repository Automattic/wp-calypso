/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if the Jetpack site has Secure Sign On (SSO) enabled.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {boolean} Whether the site has SSO enabled.
 */
export default function isSSOEnabled( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}
	return site?.options?.active_modules?.includes( 'sso' );
}
