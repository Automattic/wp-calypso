import getSiteFeatures from 'calypso/state/selectors/get-site-features';

/**
 * Check if the feature is available for the site.
 *
 * @param  {object}  state      Global state tree
 * @param  {number}  siteId     The ID of the site we're querying
 * @param  {string}  featureId  The dotcom feature to check.
 * @returns {false|string[]}    Plasns array if the feature is available. Otherwise, False.
 */
export default function hasAvailableSiteFeature( state, siteId, featureId ) {
	const siteFeatures = getSiteFeatures( state, siteId );

	if ( ! siteFeatures?.available ) {
		return false;
	}

	return siteFeatures.available[ featureId ] ?? false;
}
