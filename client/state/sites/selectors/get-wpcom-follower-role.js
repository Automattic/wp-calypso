/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getSite } from 'calypso/state/sites/selectors';

/**
 * Retrieve the WPCOM follower role info, based on site settings
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {object}         Follower role object
 */
const getWpcomFollowerRole = ( state, siteId ) => {
	const site = getSite( state, siteId );
	const displayName = site.is_private
		? translate( 'Viewer', { context: 'Role that is displayed in a select' } )
		: translate( 'Follower', { context: 'Role that is displayed in a select' } );

	return {
		display_name: displayName,
		name: 'follower',
	};
};

export default getWpcomFollowerRole;
