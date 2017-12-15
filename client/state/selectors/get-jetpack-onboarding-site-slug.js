/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getJetpackOnboardingSiteId } from 'state/selectors';
import { urlToSlug } from 'lib/url';

/**
 * Returns the slug of the site that is currently in the Jetpack Onboarding flow.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       Jetpack Onboarding site slug
 */
export default state => {
	const siteId = getJetpackOnboardingSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	const siteUrl = get( state.jetpackOnboarding.credentials, [ siteId, 'siteUrl' ], null );
	if ( ! siteUrl ) {
		return null;
	}

	return urlToSlug( siteUrl );
};
