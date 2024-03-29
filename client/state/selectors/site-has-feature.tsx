import getSiteFeatures from 'calypso/state/selectors/get-site-features';
import type { AppState } from 'calypso/types';

/**
 * Whether a given feature is available to the specified site.
 * @see 2c4dd-pb/#plain
 * @param  {Object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {string}  featureSlug The dotcom feature to check. This corresponds to the feature values in WPCOM_Features
 *                               on the wpcom side.
 * @returns {boolean} True if the feature is active. Otherwise, False.
 */
export default function siteHasFeature(
	state: AppState,
	siteId: number | null | undefined,
	featureSlug: string
) {
	const siteFeatures = getSiteFeatures( state, siteId );

	if ( ! siteFeatures?.active ) {
		return false;
	}

	return siteFeatures.active.indexOf( featureSlug ) >= 0;
}
