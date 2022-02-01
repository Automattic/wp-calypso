import getSiteFeatures from 'calypso/state/selectors/get-site-features';

/**
 * Check if the feature is active in the site.
 *
 * @param  {object}  state      Global state tree
 * @param  {number}  siteId     The ID of the site we're querying
 * @param  {string}  featureId  The dotcom feature to check.
 * @returns {boolean}           True if the feature is active. Otherwise, False.
 */
export default function hasActiveSiteFeature( state, siteId, featureId ) {
	const siteFeatures = getSiteFeatures( state, siteId );

	if ( ! siteFeatures?.active ) {
		return false;
	}

	return siteFeatures.active.indexOf( featureId ) >= 0;
}
