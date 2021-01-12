/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import hasSitePendingAutomatedTransfer from 'calypso/state/selectors/has-site-pending-automated-transfer';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns true if current user can see and use the Calypso-based Store option in menu
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is previewable
 */
export default function canCurrentUserUseCalypsoStore( state, siteId = null ) {
	if (
		config.isEnabled( 'woocommerce/store-removed' ) ||
		! config.isEnabled( 'woocommerce/extension-dashboard' )
	) {
		return false;
	}

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
