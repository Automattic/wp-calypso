import { getSite } from 'calypso/state/sites/selectors';

/**
 * Returns true if the site is unlaunched
 * @param {Object} state Global state tree
 * @param {number|string|undefined|null} siteId Site ID
 * @returns {boolean} True if site is unlaunched
 */
export default function isUnlaunchedSite( state, siteId ) {
	const site = getSite( state, siteId );

	return site?.launch_status === 'unlaunched';
}
