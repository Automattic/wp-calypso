/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';

/**
 * Returns true if site is a WP.org, non-Atomic Jetpack site, false if the site
 * is a Simple or Atomic site, or null if the site is unknown.
 *
 * @param  {object}    state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site is a WP.org Jetpack site
 */
export default function isJetpackNotAtomicSite( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return site.jetpack && ! get( site, [ 'options', 'is_automated_transfer' ], null );
}
