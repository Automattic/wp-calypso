import store from 'store';
import { getCurrentUserEmail, getCurrentUserId } from 'calypso/state/current-user/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import isSiteWpcomStaging from './is-site-wpcom-staging';
import type { AppState } from 'calypso/types';

/**
 * Whether or not the current user can start a site owner transfer.
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} Whether current user can start site owner transfer.
 */
export default function canCurrentUserStartSiteOwnerTransfer(
	state: AppState,
	siteId: number | null
): boolean {
	const userId = getCurrentUserId( state );
	const userEmail = getCurrentUserEmail( state );
	const siteOwnerId = getSelectedSite( state )?.site_owner;
	if ( ! siteOwnerId || ! userId || ! siteId ) {
		return false;
	}

	const isNonAtomicJetpackSite =
		isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId );

	// These sites can't be transferred.
	if (
		isNonAtomicJetpackSite ||
		isSiteP2Hub( state, siteId ) ||
		isSiteWPForTeams( state, siteId ) ||
		isVipSite( state, siteId ) ||
		isSiteWpcomStaging( state, siteId )
	) {
		return false;
	}

	const inviteCacheKey = 'accepted_site_transfer_invite';
	const acceptedInvite = store.get( inviteCacheKey );

	store.remove( inviteCacheKey );

	// Allow user to accept the site transfer if they just have accepted the site transfer.
	if ( acceptedInvite && acceptedInvite.sentTo === userEmail ) {
		return true;
	}

	return siteOwnerId === userId;
}
