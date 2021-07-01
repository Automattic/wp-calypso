/**
 * Internal dependencies
 */
import getSiteFeatures from 'calypso/state/selectors/get-site-features';

/**
 * Get the plan the site would need to upgrade to in order
 * to get a particular available feature.
 *
 * @param  {object}  state      Global state tree
 * @param  {number}  siteId     The ID of the site we're querying
 * @param  {string}  featureId  The dotcom feature to check.
 * @returns {string|null}    Plan slug if feature is available. Otherwise, return null.
 */
export default ( state, siteId, featureId ) => {
	const siteFeatures = getSiteFeatures( state, siteId );

	if ( ! siteFeatures?.available[ featureId ] ) {
		return null;
	}

	return siteFeatures.available[ featureId ][ 0 ] ?? null;
};
