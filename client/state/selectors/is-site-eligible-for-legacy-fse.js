import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Checks if a site is eligible for the Full Site Editing experience
 *
 * @param {object} state  Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} True if the site is eligible for Full Site Editing, otherwise false
 */
export default function isSiteEligibleForLegacyFSE( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.is_fse_eligible ?? false;
}
