/**
 * Internal dependencies
 */
import { HAPPYCHAT_GROUP_WPCOM, HAPPYCHAT_GROUP_JPOP } from 'calypso/state/happychat/constants';
import { isEnabled } from 'calypso/config';
import { isJetpackSite, getSite } from 'calypso/state/sites/selectors';
import { isATEnabled } from 'calypso/lib/automated-transfer';
import { getSectionName } from 'calypso/state/ui/selectors';

/**
 * Grab the group or groups for happychat based on siteId
 *
 * @param {object} state Current state
 * @param {int} siteId The site id, if no siteId is present primary siteId will be used
 * @returns {Array} of groups for site Id
 */
export default ( state, siteId ) => {
	const groups = [];

	// For Jetpack Connect we need to direct chat users to the JPOP group, to account for cases
	// when the user does not have a site yet, or their primary site is not a Jetpack site.
	if ( isEnabled( 'jetpack/happychat' ) && getSectionName( state ) === 'jetpack-connect' ) {
		groups.push( HAPPYCHAT_GROUP_JPOP );
		return groups;
	}

	const siteDetails = getSite( state, siteId );

	if ( isATEnabled( siteDetails ) ) {
		// AT sites should go to WP.com even though they are jetpack also
		groups.push( HAPPYCHAT_GROUP_WPCOM );
	} else if ( isJetpackSite( state, siteId ) ) {
		groups.push( HAPPYCHAT_GROUP_JPOP );
	} else {
		groups.push( HAPPYCHAT_GROUP_WPCOM );
	}
	return groups;
};
