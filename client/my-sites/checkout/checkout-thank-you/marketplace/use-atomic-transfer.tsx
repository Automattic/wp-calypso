import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useAtomicTransfer( isAtomicNeeded: boolean ) {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	const [ isAtomicTransferCheckComplete, setIsAtomicTransferCheckComplete ] = useState(
		! isAtomicNeeded
	);
	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );

	useEffect( () => {
		setIsAtomicTransferCheckComplete( ! isAtomicNeeded );
	}, [ isAtomicNeeded ] );

	// Site is transferring to Atomic.
	// Poll the transfer status.
	useEffect( () => {
		if ( siteId && transferStatus === transferStates.COMPLETE ) {
			setIsAtomicTransferCheckComplete( true );
		}

		if (
			! siteId ||
			transferStatus === transferStates.COMPLETE ||
			isJetpackSelfHosted ||
			! isAtomicNeeded
		) {
			return;
		}

		if ( ! isFetchingTransferStatus ) {
			waitFor( 2 ).then( () => dispatch( fetchAutomatedTransferStatus( siteId ) ) );
		}
	}, [
		siteId,
		dispatch,
		transferStatus,
		isFetchingTransferStatus,
		isJetpackSelfHosted,
		isAtomicNeeded,
	] );

	return isAtomicTransferCheckComplete;
}
