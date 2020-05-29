/**
 * Indicates whether a site is eligible for Jetpack Cloud.
 *
 * @param {object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {boolean|undefined} true is the site is eligible, undefined if still loading.
 */
export default function isJetpackCloudEligible( state, siteId ) {
	return state.rewind?.[ siteId ]?.state?.hasCloud;
}
