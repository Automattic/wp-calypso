/**
 * Internal dependencies
 */
import getSiteOptions from 'calypso/state/selectors/get-site-options';

/**
 * Indicates whether a site is eligible for Jetpack Cloud.
 *
 * @param {object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {boolean|undefined} true is the site is eligible, undefined if still loading.
 */
export default function isJetpackCloudEligible( state, siteId ) {
	const site = getSiteOptions( state, siteId );
	if ( ! site ) {
		return undefined;
	}
	return site?.is_cloud_eligible;
}
