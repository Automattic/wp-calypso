/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if currently requesting roles for the specified site ID, or
 * false otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    Site ID
 * @return {Boolean}           Whether that shortcode is being requested
 */
export const isRequestingSiteRoles = ( state, siteId ) => {
	return get( state.siteRoles.requesting, [ siteId ], false );
};

/**
 * Retrieve the site roles, supported in a particular site
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @return {Array}           Site roles
 */
export const getSiteRoles = ( state, siteId ) => {
	return get( state.siteRoles.items, [ siteId ] );
};
