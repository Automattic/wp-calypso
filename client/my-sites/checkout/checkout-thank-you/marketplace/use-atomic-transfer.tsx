import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { useSelector, useDispatch } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { requestSite } from 'calypso/state/sites/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useAtomicTransfer(
	isAtomicNeeded: boolean
): [ boolean, number, boolean, Dispatch< SetStateAction< boolean > > ] {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId as number ) );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);
	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );

	const [ isAtomicTransferCheckComplete, setIsAtomicTransferCheckComplete ] = useState(
		! isAtomicNeeded
	);
	const [ showProgressBar, setShowProgressBar ] = useState(
		! new URLSearchParams( document.location.search ).has( 'hide-progress-bar' )
	);
	const [ currentStep, setCurrentStep ] = useState( 0 );

	useEffect( () => {
		setIsAtomicTransferCheckComplete( ! isAtomicNeeded );
	}, [ isAtomicNeeded ] );

	// Site is transferring to Atomic.
	// Poll the transfer status.
	useEffect( () => {
		// Check the transfer status through the isSiteAtomic selector.
		// This uses the `is_wpcom_atomic` flag returned by the sites endpoint.
		if ( siteId && isSiteAtomic ) {
			setIsAtomicTransferCheckComplete( true );
		}

		if ( ! siteId || isSiteAtomic || isJetpackSelfHosted || ! isAtomicNeeded ) {
			return;
		}

		if ( ! isFetchingTransferStatus && transferStatus !== transferStates.COMPLETE ) {
			waitFor( 2 ).then( () => dispatch( fetchAutomatedTransferStatus( siteId ) ) );
		}

		// Once the transferStatus is reported complete, query the sites endpoint
		// until the `is_wpcom_atomic` = true is returned
		if ( transferStatus === transferStates.COMPLETE && ! isSiteAtomic ) {
			waitFor( 2 ).then( () => dispatch( requestSite( siteId ) ) );
		}
	}, [
		siteId,
		dispatch,
		transferStatus,
		isFetchingTransferStatus,
		isJetpackSelfHosted,
		isAtomicNeeded,
		isSiteAtomic,
	] );

	// Set progressbar (currentStep) depending on transfer/plugin status.
	useEffect( () => {
		// We don't want to show the progress bar again when it is hidden.
		if ( ! showProgressBar ) {
			return;
		}

		// Sites already transferred to Atomic or self-hosted Jetpack sites no longer need to change the current step.
		if ( isJetpack ) {
			return;
		}

		if ( transferStatus === transferStates.ACTIVE ) {
			setCurrentStep( 0 );
		} else if ( transferStatus === transferStates.PROVISIONED ) {
			setCurrentStep( 1 );
		} else if ( transferStatus === transferStates.RELOCATING ) {
			setCurrentStep( 2 );
		} else if ( transferStatus === transferStates.COMPLETE ) {
			setCurrentStep( 3 );
		}
	}, [ transferStatus, showProgressBar, isJetpack ] );

	return [ isAtomicTransferCheckComplete, currentStep, showProgressBar, setShowProgressBar ];
}
