/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import getSiteFeatures from 'calypso/state/selectors/get-site-features';

export default function hasActiveSiteFeature( state, siteId, featureId ) {
	const siteFeatures = getSiteFeatures( state, siteId );

	if ( ! siteFeatures?.active ) {
		return false;
	}

	return siteFeatures.active.indexOf( featureId ) >= 0;
}
