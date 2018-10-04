/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the Jetpack onboarding credentials of a particular site.
 * Returns null if site is not known.
 *
 * @param  {Object}   state   Global state tree.
 * @param  {Integer}  siteId  Unconnected site ID.
 * @return {?Object}          An object containing the onboarding credentials of the site.
 */
export default function getUnconnectedSite( state, siteId ) {
	return get( state.jetpack.onboarding.credentials, siteId, null );
}
