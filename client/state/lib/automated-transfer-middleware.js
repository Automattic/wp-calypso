import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { isFetchingAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import hasSitePendingAutomatedTransfer from 'calypso/state/selectors/has-site-pending-automated-transfer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const fetchAutomatedTransferStatusForSelectedSite = ( dispatch, getState ) => {
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const isFetchingATStatus = isFetchingAutomatedTransferStatus( state, siteId );

	if ( ! isFetchingATStatus && hasSitePendingAutomatedTransfer( state, siteId ) ) {
		dispatch( fetchAutomatedTransferStatus( siteId ) );
	}
};
