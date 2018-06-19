/** @format */
/**
 * External dependencies
 */
import { findKey } from 'lodash';

/**
 * Internal dependencies
 */
import { urlToSlug } from 'lib/url';

/**
 * Returns the ID of particular Jetpack onboarding site by the site slug.
 * Returns null if site is not known.
 *
 * @param  {Object}   state     Global state tree.
 * @param  {String}   siteSlug  Slug of the unconnected site.
 * @return {?Integer}           ID of the unconnected site.
 */
export default function getUnconnectedSiteIdBySlug( state, siteSlug ) {
	const siteId = findKey(
		state.jetpack.onboarding.credentials,
		( { siteUrl } ) => siteSlug === urlToSlug( siteUrl )
	);

	if ( ! siteId ) {
		return null;
	}

	return parseInt( siteId, 10 );
}
