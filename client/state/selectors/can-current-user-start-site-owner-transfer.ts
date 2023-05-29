import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

/**
 * Whether or not the current user can start a site owner transfer.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} Whether current user can start site owner transfer.
 */
export default function canCurrentUserStartSiteOwnerTransfer(
	state: AppState,
	siteId: number | null
): boolean {
	const userId = getCurrentUserId( state );
	const siteOwnerId = getSelectedSite( state )?.site_owner;
	if ( ! siteOwnerId || ! userId || ! siteId ) {
		return false;
	}

	// These sites can't be transferred.
	if (
		isJetpackSite( state, siteId ) ||
		isSiteP2Hub( state, siteId ) ||
		isSiteWPForTeams( state, siteId ) ||
		isVipSite( state, siteId ) ||
		isSiteAutomatedTransfer( state, siteId )
	) {
		return false;
	}

	return siteOwnerId === userId;
}
