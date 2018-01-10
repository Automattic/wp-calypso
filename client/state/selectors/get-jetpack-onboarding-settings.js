/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default function getJetpackOnboardingSettings( state, siteId ) {
	return get( state.jetpackOnboarding.settings, siteId, null );
}
