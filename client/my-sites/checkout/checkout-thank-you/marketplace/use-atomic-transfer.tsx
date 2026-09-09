import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useSelector, useDispatch } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import {
	transferCompleteStates,
	transferFailureStates,
	transferStates,
} from 'calypso/state/automated-transfer/constants';
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

// The status endpoint returns the site's *latest* transfer, so right after a purchase a
// settled failure can belong to a previous transfer whose record has not been superseded
// yet. A failure is only trusted after a few confirmations spaced far enough apart for
// the new record to appear.
export const FAILURE_CONFIRM_ATTEMPTS = 3;
const FAILURE_CONFIRM_INTERVAL_MS = 3000;

type AtomicTransferData = {
	isAtomicTransferCheckComplete: boolean;
	currentStep: number;
	showProgressBar: boolean;
	setShowProgressBar: Dispatch< SetStateAction< boolean > >;
	isRetryingTransferStatus: boolean;
	trustedTransferStatus: string | null;
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
	// Redux already holds a transfer status when this page mounts — possibly a stale one from
	// earlier in the SPA session. Only statuses observed from a response of this wait are safe
	// to act on.
	const [ trustedTransferStatus, setTrustedTransferStatus ] = useState< string | null >( null );
	const statusRequestSiteIdRef = useRef< number | null >( null );
	const atomicFlagRequestSiteIdRef = useRef< number | null >( null );
	const wasFetchingStatusRef = useRef( false );
	const failureConfirmAttemptsRef = useRef( 0 );
	const pendingRetryRef = useRef( false );
	const confirmTimeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	useEffect( () => {
		setIsAtomicTransferCheckComplete( ! isAtomicNeeded );
	}, [ isAtomicNeeded ] );

	useEffect(
		() => () => {
			if ( confirmTimeoutRef.current ) {
				clearTimeout( confirmTimeoutRef.current );
			}
		},
		[]
	);

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
		dispatch( fetchAutomatedTransferStatus( siteId, 'start' ) );
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

	const performStatusRetry = useCallback(
		( targetSiteId: number ) => {
			statusRequestSiteIdRef.current = targetSiteId;
			dispatch( fetchAutomatedTransferStatus( targetSiteId, 'start' ) );
		},
		[ dispatch ]
	);

	useEffect( () => {
		if ( isFetchingTransferStatus ) {
			wasFetchingStatusRef.current = true;
			return;
		}
		if ( ! wasFetchingStatusRef.current ) {
			return;
		}
		wasFetchingStatusRef.current = false;

		// A "Check again" click that arrived while a request was in flight: that response is
		// stale, so discard it and run the queued reset now.
		if ( pendingRetryRef.current ) {
			pendingRetryRef.current = false;
			if ( siteId ) {
				performStatusRetry( siteId );
			}
			return;
		}

		const isFailure = transferFailureStates.includes( transferStatus );
		if ( isFailure && failureConfirmAttemptsRef.current < FAILURE_CONFIRM_ATTEMPTS ) {
			failureConfirmAttemptsRef.current += 1;
			confirmTimeoutRef.current = setTimeout( () => {
				if ( siteId ) {
					dispatch( fetchAutomatedTransferStatus( siteId, 'start' ) );
				}
			}, FAILURE_CONFIRM_INTERVAL_MS );
			return;
		}

		if ( ! isFailure ) {
			failureConfirmAttemptsRef.current = 0;
		}
		setTrustedTransferStatus( transferStatus );
		setIsRetryingTransferStatus( false );
	}, [ dispatch, isFetchingTransferStatus, performStatusRetry, siteId, transferStatus ] );

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

	// Gate on the trusted status, not the raw shared one: a stale persisted COMPLETE from an
	// earlier transfer must not start the atomic-flag poll or short-circuit "Check again".
	const isTransferComplete = transferCompleteStates.includes( trustedTransferStatus );
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
				dispatch( fetchAutomatedTransferStatus( siteId, 'single' ) );
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

	const retry = useCallback( () => {
		if ( ! siteId ) {
			return;
		}

		if ( isTransferComplete ) {
			requestAtomicSite();
			return;
		}

		if ( confirmTimeoutRef.current ) {
			clearTimeout( confirmTimeoutRef.current );
		}
		failureConfirmAttemptsRef.current = 0;
		setIsRetryingTransferStatus( true );
		if ( isFetchingTransferStatus ) {
			pendingRetryRef.current = true;
			return;
		}
		performStatusRetry( siteId );
	}, [
		isFetchingTransferStatus,
		isTransferComplete,
		performStatusRetry,
		requestAtomicSite,
		siteId,
	] );

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
		trustedTransferStatus,
		retry,
	};
}
