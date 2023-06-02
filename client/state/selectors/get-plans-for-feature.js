import getSiteFeatures from 'calypso/state/selectors/get-site-features';

/**
 * Gets the list of plans that contain the passed feature.
 *
 * Used to determine which plan to upgrade to, in order for a site to gain access to a feature.
 *
 * @param  {Object}  state      Global state tree
 * @param  {number}  siteId     The ID of the site we're querying
 * @param  {string}  featureId  The dotcom feature to check.
 * @returns {false|string[]}    Plans array if the feature is available. Otherwise, False.
 */
export default function getPlansForFeature( state, siteId, featureId ) {
	const siteFeatures = getSiteFeatures( state, siteId );

	if ( ! siteFeatures?.available ) {
		return false;
	}

	return siteFeatures.available[ featureId ] ?? false;
}
