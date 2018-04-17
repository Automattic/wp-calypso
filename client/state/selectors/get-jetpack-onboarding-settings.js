/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getJetpackSettings } from 'state/selectors';

/**
 * Returns the Jetpack onboarding settings of a given site.
 * Returns null it the site is unknown.
 *
 * @param  {Object}   state   Global state tree.
 * @param  {Integer}  siteId  Unconnected site ID.
 * @return {?Object}          An object containing the currently known onboarding settings of the site.
 */
export default function getJetpackOnboardingSettings( state, siteId ) {
	return get( getJetpackSettings( state, siteId ), [ 'onboarding' ], null );
}
