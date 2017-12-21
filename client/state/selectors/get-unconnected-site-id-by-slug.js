/** @format */
/**
 * External dependencies
 */
import { findKey } from 'lodash';

/**
 * Internal dependencies
 */
import { urlToSlug } from 'lib/url';

export default function getUnconnectedSiteIdBySlug( state, siteSlug ) {
	const siteId = findKey(
		state.jetpackOnboarding.credentials,
		( { siteUrl } ) => siteSlug === urlToSlug( siteUrl )
	);

	if ( ! siteId ) {
		return null;
	}

	return parseInt( siteId, 10 );
}
