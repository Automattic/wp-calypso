/**
 * Frozen empty object
 *
 * @type {SitesItem}
 */
const EMPTY_SITES = Object.freeze( {} );

/**
 * @typedef {{
 ID?: number;
 name?: string;
 description?: string;
 URL?: string;
 capabilities?: Record<string, boolean>;
 jetpack?: boolean;
 is_multisite?: boolean;
 site_owner?: number;
 lang?: string;
 visible?: boolean;
 is_private?: boolean;
 is_coming_soon?: boolean;
 single_user_site?: boolean;
 is_vip?: boolean;
 }} SitesItem
 */

/**
 * Returns site items object or empty object.
 *
 *
 * @param {object} state  Global state tree
 * @returns {Object.<number, SitesItem>}        Site items object or empty object
 */
export default function getSitesItems( state ) {
	return state.sites.items || EMPTY_SITES;
}
