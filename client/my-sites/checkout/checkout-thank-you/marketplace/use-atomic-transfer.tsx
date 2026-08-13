import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useSelector, useDispatch } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferCompleteStates, transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { requestSite } from 'calypso/state/sites/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { THANK_YOU_RECOVERY_INTERVAL_MS } from './use-thank-you-deadline';

const ATOMIC_FLAG_POLL_INTERVAL_MS = 2000;

type AtomicTransferData = {
	isAtomicTransferCheckComplete: boolean;
	currentStep: number;
	showProgressBar: boolean;
	setShowProgressBar: Dispatch< SetStateAction< boolean > >;
	isRetryingTransferStatus: boolean;
	retry: () => void;
};

export function useAtomicTransfer(
	isAtomicNeeded: boolean,
	isRecoveryMode: boolean,
	isDeadlineInitialized: boolean
): AtomicTransferData {
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
	const [ isRetryingTransferStatus, setIsRetryingTransferStatus ] = useState( false );
	const statusRequestSiteIdRef = useRef< number | null >( null );
	const atomicFlagRequestSiteIdRef = useRef< number | null >( null );
	const retryObservedFetchingRef = useRef( false );

	useEffect( () => {
		setIsAtomicTransferCheckComplete( ! isAtomicNeeded );
	}, [ isAtomicNeeded ] );

	useEffect( () => {
		if ( siteId && isSiteAtomic ) {
			setIsAtomicTransferCheckComplete( true );
		}

		if (
			! siteId ||
			isSiteAtomic ||
			isJetpackSelfHosted ||
			! isAtomicNeeded ||
			! isDeadlineInitialized ||
			isRecoveryMode ||
			isFetchingTransferStatus ||
			statusRequestSiteIdRef.current === siteId
		) {
			return;
		}

		statusRequestSiteIdRef.current = siteId;
		dispatch( fetchAutomatedTransferStatus( siteId ) );
	}, [
		dispatch,
		isAtomicNeeded,
		isDeadlineInitialized,
		isFetchingTransferStatus,
		isJetpackSelfHosted,
		isRecoveryMode,
		isSiteAtomic,
		siteId,
	] );

	const requestAtomicSite = useCallback( () => {
		if ( ! siteId || atomicFlagRequestSiteIdRef.current === siteId ) {
			return;
		}

		atomicFlagRequestSiteIdRef.current = siteId;
		const clearInFlightRequest = () => {
			if ( atomicFlagRequestSiteIdRef.current === siteId ) {
				atomicFlagRequestSiteIdRef.current = null;
			}
		};
		Promise.resolve( dispatch( requestSite( siteId ) ) ).then(
			clearInFlightRequest,
			clearInFlightRequest
		);
	}, [ dispatch, siteId ] );

	const isTransferComplete = transferCompleteStates.includes( transferStatus );
	const isWaitingForAtomicFlag =
		!! siteId && isTransferComplete && ! isSiteAtomic && ! isJetpackSelfHosted && isAtomicNeeded;
	let atomicFlagPollInterval: number | null = null;
	if ( isWaitingForAtomicFlag ) {
		atomicFlagPollInterval = isRecoveryMode
			? THANK_YOU_RECOVERY_INTERVAL_MS
			: ATOMIC_FLAG_POLL_INTERVAL_MS;
	}

	useInterval( requestAtomicSite, atomicFlagPollInterval );

	useInterval(
		() => {
			if ( siteId && ! isFetchingTransferStatus ) {
				dispatch( fetchAutomatedTransferStatus( siteId, { singleCheck: true } ) );
			}
		},
		isRecoveryMode &&
			siteId &&
			! isTransferComplete &&
			! isSiteAtomic &&
			! isJetpackSelfHosted &&
			isAtomicNeeded
			? THANK_YOU_RECOVERY_INTERVAL_MS
			: null
	);

	useEffect( () => {
		if ( ! isRetryingTransferStatus ) {
			return;
		}
		if ( isFetchingTransferStatus ) {
			retryObservedFetchingRef.current = true;
		} else if ( retryObservedFetchingRef.current ) {
			retryObservedFetchingRef.current = false;
			setIsRetryingTransferStatus( false );
		}
	}, [ isFetchingTransferStatus, isRetryingTransferStatus ] );

	const retry = useCallback( () => {
		if ( ! siteId ) {
			return;
		}

		if ( isTransferComplete ) {
			requestAtomicSite();
		} else if ( ! isFetchingTransferStatus ) {
			statusRequestSiteIdRef.current = siteId;
			setIsRetryingTransferStatus( true );
			dispatch( fetchAutomatedTransferStatus( siteId, { resetPolling: true } ) );
		}
	}, [ dispatch, isFetchingTransferStatus, isTransferComplete, requestAtomicSite, siteId ] );

	useEffect( () => {
		if ( ! showProgressBar || isJetpack ) {
			return;
		}

		if ( transferStatus === transferStates.ACTIVE ) {
			setCurrentStep( 0 );
		} else if ( transferStatus === transferStates.PROVISIONED ) {
			setCurrentStep( 1 );
		} else if ( transferStatus === transferStates.RELOCATING ) {
			setCurrentStep( 2 );
		} else if ( transferCompleteStates.includes( transferStatus ) ) {
			setCurrentStep( 3 );
		}
	}, [ transferStatus, showProgressBar, isJetpack ] );

	return {
		isAtomicTransferCheckComplete,
		currentStep,
		showProgressBar,
		setShowProgressBar,
		isRetryingTransferStatus,
		retry,
	};
}
