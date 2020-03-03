/**
 * Internal dependencies
 */
import config from 'config';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import { transferStates } from 'state/automated-transfer/constants';
import hasSitePendingAutomatedTransfer from 'state/selectors/has-site-pending-automated-transfer';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Returns true if current user can see and use Store option in menu
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is previewable
 */
export default function canCurrentUserUseStore( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const canUserManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const isSiteAT = !! isSiteAutomatedTransfer( state, siteId );

	const hasSitePendingAT = hasSitePendingAutomatedTransfer( state, siteId );
	const transferStatus = getAutomatedTransferStatus( state, siteId );
	const siteHasBackgroundTransfer = hasSitePendingAT && transferStatus !== transferStates.ERROR;

	return (
		( canUserManageOptions && isSiteAT ) ||
		( config.isEnabled( 'signup/atomic-store-flow' ) && siteHasBackgroundTransfer )
	);
}
