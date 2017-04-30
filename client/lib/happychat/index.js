/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_GROUP_WPCOM,
	HAPPYCHAT_GROUP_JPOP
} from 'state/happychat/constants';
import { isJetpackSite } from 'state/sites/selectors';

/**
 * Get happychat group for site id
 * For now if the site is jetpack jpop will be set as the group otherwise WP.COM
 * @param {object} state Current state
 * @param {int} siteId The site id, if no siteId is present primary siteId will be used
 * @returns {string} The happychat group for the selected site
 */
export const getGroupForSiteId = ( state, siteId ) => {
	switch ( true ) {
		case isJetpackSite( state, siteId ):
			return HAPPYCHAT_GROUP_JPOP;

		default:
			return HAPPYCHAT_GROUP_WPCOM;
	}
};

/**
 * Grab the group or groups for happychat based on siteId
 * @param {object} state Current state
 * @param {int} siteId The site id, if no siteId is present primary siteId will be used
 * @returns {array} of groups for site Id
 */
export const getGroups = ( state, siteId ) => {
	return [ getGroupForSiteId( state, siteId ) ];
};
