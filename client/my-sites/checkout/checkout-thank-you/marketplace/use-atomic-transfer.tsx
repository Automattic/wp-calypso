import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { requestSite } from 'calypso/state/sites/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const POLL_INTERVAL_MS = 2000;

export function useAtomicTransfer(
	isAtomicNeeded: boolean
): [ boolean, number, boolean, Dispatch< SetStateAction< boolean > > ] {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId as number ) );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;
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

	useEffect( () => {
		if ( siteId && isSiteAtomic ) {
			setIsAtomicTransferCheckComplete( true );
		}
	}, [ siteId, isSiteAtomic ] );

	// Phase 1: poll the automated-transfer status until COMPLETE.
	useEffect( () => {
		if (
			! siteId ||
			isSiteAtomic ||
			isJetpackSelfHosted ||
			! isAtomicNeeded ||
			transferStatus === transferStates.COMPLETE
		) {
			return;
		}
		dispatch( fetchAutomatedTransferStatus( siteId ) );
		const intervalId = window.setInterval( () => {
			dispatch( fetchAutomatedTransferStatus( siteId ) );
		}, POLL_INTERVAL_MS );
		return () => window.clearInterval( intervalId );
	}, [ siteId, dispatch, transferStatus, isJetpackSelfHosted, isAtomicNeeded, isSiteAtomic ] );

	// Phase 2: once status is COMPLETE, poll the site endpoint until
	// `is_wpcom_atomic` flips. This is the loop that was previously a one-shot.
	useEffect( () => {
		if (
			! siteId ||
			isSiteAtomic ||
			isJetpackSelfHosted ||
			! isAtomicNeeded ||
			transferStatus !== transferStates.COMPLETE
		) {
			return;
		}
		dispatch( requestSite( siteId ) );
		const intervalId = window.setInterval( () => {
			dispatch( requestSite( siteId ) );
		}, POLL_INTERVAL_MS );
		return () => window.clearInterval( intervalId );
	}, [ siteId, dispatch, transferStatus, isJetpackSelfHosted, isAtomicNeeded, isSiteAtomic ] );

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
