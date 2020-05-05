/**
 * Frozen empty object
 *
 * @type {object}
 */
const EMPTY_SITES = Object.freeze( {} );

/**
 * Returns site items object or empty object.
 *
 *
 * @param {object} state  Global state tree
 * @returns {object}        Site items object or empty object
 */

export default function getSitesItems( state ) {
	return state.sites.items || EMPTY_SITES;
}
