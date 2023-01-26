import { HAPPYCHAT_GROUP_WPCOM, HAPPYCHAT_GROUP_JPOP } from 'calypso/state/happychat/constants';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';

/**
 * Grab the group or groups for happychat based on siteId
 *
 * @param {Object} state Current state
 * @param {number} siteId The site id, if no siteId is present primary siteId will be used
 * @returns {Array} of groups for site Id
 */
export default ( state, siteId ) => {
	// For Jetpack Connect we need to direct chat users to the JPOP group, to account for cases
	// when the user does not have a site yet, or their primary site is not a Jetpack site.
	if ( getSectionName( state ) === 'jetpack-connect' ) {
		return [ HAPPYCHAT_GROUP_JPOP ];
	}

	// AT sites should go to WP.com even though they are jetpack also
	if ( isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId ) ) {
		return [ HAPPYCHAT_GROUP_JPOP ];
	}

	return [ HAPPYCHAT_GROUP_WPCOM ];
};
