/**
 * External dependencies
 */
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getSite } from 'calypso/state/sites/selectors';

import 'calypso/state/site-roles/init';

/**
 * Returns true if currently requesting roles for the specified site ID, or
 * false otherwise.
 *
 * @param  {object}  state     Global state tree
 * @param  {number}  siteId    Site ID
 * @returns {boolean}           Whether that shortcode is being requested
 */
export const isRequestingSiteRoles = ( state, siteId ) => {
	return get( state.siteRoles.requesting, [ siteId ], false );
};

/**
 * Retrieve the site roles, supported in a particular site
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {Array}           Site roles
 */
export const getSiteRoles = ( state, siteId ) => {
	return get( state.siteRoles.items, [ siteId ] );
};

/**
 * Retrieve the WPCOM follower role info, based on site settings
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {object}         Follower role object
 */
export const getWpcomFollowerRole = ( state, siteId ) => {
	const site = getSite( state, siteId );
	const displayName = site.is_private
		? translate( 'Viewer', { context: 'Role that is displayed in a select' } )
		: translate( 'Follower', { context: 'Role that is displayed in a select' } );

	return {
		display_name: displayName,
		name: 'follower',
	};
};
