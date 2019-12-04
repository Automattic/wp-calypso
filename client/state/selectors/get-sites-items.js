/**
 * Frozen empty object
 *
 * @type {Object}
 */
const EMPTY_SITES = Object.freeze( {} );

/**
 * Returns site items object or empty object.
 *
 *
 * @param {Object} state  Global state tree
 * @return {Object}        Site items object or empty object
 */

export default function getSitesItems( state ) {
	return state.sites.items || EMPTY_SITES;
}
