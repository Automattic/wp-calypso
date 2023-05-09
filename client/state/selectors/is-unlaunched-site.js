import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if the site is unlaunched
 *
 * @param {Object} state Global state tree
 * @param {number|string|undefined|null} siteId Site ID
 * @returns {boolean} True if site is unlaunched
 */
export default function isUnlaunchedSite( state, siteId ) {
	const site = getRawSite( state, siteId );

	return site?.launch_status === 'unlaunched';
}
