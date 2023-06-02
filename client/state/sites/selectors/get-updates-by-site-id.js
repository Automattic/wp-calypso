import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns the updates object for a site
 *
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {Object} Available updates for the site
 */
export default function getUpdatesBySiteId( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.updates ?? null;
}
