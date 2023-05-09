import { getSiteOptions } from 'calypso/state/sites/selectors';

/**
 * Indicates whether a site is eligible for Jetpack Cloud.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {boolean|undefined} true is the site is eligible, undefined if still loading.
 */
export default function isJetpackCloudEligible( state, siteId ) {
	const site = getSiteOptions( state, siteId );
	if ( ! site ) {
		return null;
	}
	return site.is_cloud_eligible ?? false;
}
