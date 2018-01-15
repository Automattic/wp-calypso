/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the Jetpack onboarding settings of a particular site.
 * Returns null if site is not known.
 *
 * @param  {Object}   state   Global state tree.
 * @param  {Integer}  siteId  Unconnected site ID.
 * @return {?Object}          An object containing the currently known onboarding settings of the site.
 */
export default function getJetpackOnboardingSettings( state, siteId ) {
	return get( state.jetpackOnboarding.settings, siteId, null );
}
