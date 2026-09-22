import { useDispatch, useSelect } from '@wordpress/data';
import { useSearchParams } from 'react-router-dom';
import { parseTransferCreatedAt } from 'calypso/components/transfer-wait/transfer-created-at';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import {
	createRevertedTransferWatcher,
	getTransferFailureMessage,
	isRevertedTransferStatus,
	transferStates,
} from '../utils/atomic-transfer-outcome';
import { useSiteData } from './use-site-data';
import type { SiteSelect, SiteDetails } from '@automattic/data-stores';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

// The transfer itself is bounded below (300s); these bound the shorter phases that run after it.
const POST_TRANSFER_TIMEOUT_MS = 1000 * 180;
const MAX_FEATURE_FETCH_FAILURES = 5;

const TRANSFER_TIMEOUT_MS = 1000 * 300;
const POLL_MS = 3000;

// A caller that handles the deadline itself keeps the wait alive past it: the transfer is still
// running server-side and usually lands, so polling slows down and only this far later cap ends it.
const TRANSFER_GRACE_TIMEOUT_MS = 1000 * 60 * 15;
const GRACE_POLL_MS = 10000;

// The cap is measured from the transfer, so a wait that starts on an already-doomed transfer would
// otherwise fail on its first poll. This floor buys a few polls: long enough to read the screen and
// for a completion seconds away to land, short enough that reloading cannot keep postponing the cap.
const MIN_OBSERVATION_MS = 30000;

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
	// The wait carried on afterwards, so this is a slow transfer being reported, not a dead one.
	recoverable?: boolean;
}

// A transfer the server is still working on, as opposed to one that ended (well or badly) and to
// the stale latest transfer the endpoint can hand back before ours exists.
const isTransferInFlight = ( status: string | null ) =>
	!! status &&
	status !== transferStates.COMPLETED &&
	status !== transferStates.ERROR &&
	! isRevertedTransferStatus( status );

interface UseWaitForAtomicProps {
	handleTransferFailure?: ( failureInfo: FailureInfo ) => void;
	siteId?: number;
}

export const useWaitForAtomic = ( {
	handleTransferFailure,
	siteId: providedSiteId,
}: UseWaitForAtomicProps ) => {
	const [ searchParams ] = useSearchParams();
	const reduxDispatch = useReduxDispatch();

	const { siteId: hookSiteId } = useSiteData();
	// Use provided siteId if available, otherwise fall back to hookSiteId
	const siteId = providedSiteId || hookSiteId;

	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );
	const { getSiteLatestAtomicTransfer, getSiteLatestAtomicTransferError } = useSelect(
		( select ) => select( SITE_STORE ) as SiteSelect,
		[]
	);

	const waitForInitiateTransfer = async ( plugin?: string | null ) => {
		const initiateTransferContext = searchParams.get( 'initiate_transfer_context' );
		if ( ! initiateTransferContext && ! plugin ) {
			return;
		}

		await reduxDispatch(
			initiateThemeTransfer(
				siteId,
				null,
				plugin || '',
				searchParams.get( 'initiate_transfer_geo_affinity' ) || '',
				initiateTransferContext || 'onboarding'
			)
		);
	};

	const waitForTransfer = async ( {
		onTransferStatusChange,
		onDeadlineExceeded,
	}: {
		// The transfer's own `created_at` comes along so callers can time the wait from when the
		// transfer actually began rather than from when this UI mounted.
		onTransferStatusChange?: ( status: string | null, createdAt?: string ) => void;
		// Passing this turns the deadline from an ending into a signal: the caller is telling the
		// customer the transfer is running long, and this wait keeps watching it instead of failing.
		onDeadlineExceeded?: () => void;
	} = {} ) => {
		const startTime = new Date().getTime();
		const isRevertOfThisTransfer = createRevertedTransferWatcher();
		let isPastDeadline = false;
		// Both clocks belong to the transfer, not to this component, so a reload does not restart a
		// wait that is already minutes old. Only a transfer still in flight anchors them, and only
		// for a caller that recovers, so an old in-flight transfer cannot hard-fail another caller.
		let deadlineAnchor = startTime;
		let isDeadlineAnchored = ! onDeadlineExceeded;

		while ( true ) {
			await wait( isPastDeadline ? GRACE_POLL_MS : POLL_MS );
			await requestLatestAtomicTransfer( siteId );
			const transfer = getSiteLatestAtomicTransfer( siteId );
			const transferStatus = transfer?.status ?? null;
			onTransferStatusChange?.( transferStatus, transfer?.created_at );
			if ( ! isDeadlineAnchored && isTransferInFlight( transferStatus ) && transfer?.created_at ) {
				const createdAt = parseTransferCreatedAt( transfer.created_at );
				if ( ! Number.isNaN( createdAt ) ) {
					deadlineAnchor = Math.min( createdAt, startTime );
					isDeadlineAnchored = true;
				}
			}

			const transferError = getSiteLatestAtomicTransferError( siteId );
			const isTransferringStatusFailed = transferError && transferError?.status >= 500;

			if ( isTransferringStatusFailed || transferStatus === transferStates.ERROR ) {
				handleTransferFailure?.( {
					type: 'transfer',
					error: transferError?.message || '',
					code: transferError?.code || '',
				} );
				throw new Error( getTransferFailureMessage( 'error' ) );
			}

			if ( isRevertOfThisTransfer( transfer ) ) {
				handleTransferFailure?.( {
					type: 'transfer_reverted',
					error: `transfer reverted (status: ${ transferStatus })`,
					code: 'transfer_reverted',
				} );
				throw new Error( getTransferFailureMessage( 'reverted' ) );
			}

			// Checked before the clocks below: fresh server state saying the transfer landed beats a
			// client deadline that happened to pass on the same poll.
			if ( transferStatus === transferStates.COMPLETED ) {
				break;
			}

			if ( ! isPastDeadline && deadlineAnchor + TRANSFER_TIMEOUT_MS < new Date().getTime() ) {
				isPastDeadline = true;
				// Same event at the same point, so the existing signal stays comparable; `recoverable`
				// is what separates a slow transfer from one this wait gave up on.
				handleTransferFailure?.( {
					type: 'transfer_timeout',
					error: 'transfer took too long',
					code: 'transfer_timeout',
					recoverable: !! onDeadlineExceeded,
				} );

				if ( ! onDeadlineExceeded ) {
					throw new Error( getTransferFailureMessage( 'timeout' ) );
				}

				onDeadlineExceeded();
			}

			const maxGraceFinishTime = onDeadlineExceeded
				? Math.max( deadlineAnchor + TRANSFER_GRACE_TIMEOUT_MS, startTime + MIN_OBSERVATION_MS )
				: deadlineAnchor + TRANSFER_TIMEOUT_MS;

			if ( maxGraceFinishTime < new Date().getTime() ) {
				handleTransferFailure?.( {
					type: 'transfer_grace_timeout',
					error: 'transfer never finished, even past the deadline',
					code: 'transfer_grace_timeout',
				} );
				throw new Error( getTransferFailureMessage( 'timeout' ) );
			}
		}
	};

	const waitForFeature = async () => {
		const feature = searchParams.get( 'feature' );
		if ( ! feature ) {
			return;
		}

		const maxFinishTime = new Date().getTime() + POST_TRANSFER_TIMEOUT_MS;
		let consecutiveFetchFailures = 0;

		while ( true ) {
			const siteFeatures = await reduxDispatch< Promise< { active: string[] } > >(
				fetchSiteFeatures( siteId )
			);
			if ( siteFeatures?.active?.indexOf?.( feature ) >= 0 ) {
				break;
			}

			// fetchSiteFeatures swallows request errors and resolves undefined, so a run of them
			// means the endpoint is failing, not that the feature is still activating.
			consecutiveFetchFailures = siteFeatures ? 0 : consecutiveFetchFailures + 1;
			if ( consecutiveFetchFailures >= MAX_FEATURE_FETCH_FAILURES ) {
				handleTransferFailure?.( {
					type: 'feature_fetch',
					error: `fetching site features kept failing while waiting for ${ feature }`,
					code: 'feature_fetch_failed',
				} );
				throw new Error( getTransferFailureMessage( 'error' ) );
			}

			if ( maxFinishTime < new Date().getTime() ) {
				handleTransferFailure?.( {
					type: 'feature_timeout',
					error: `feature ${ feature } did not activate in time`,
					code: 'feature_timeout',
				} );
				throw new Error( getTransferFailureMessage( 'timeout' ) );
			}

			await wait( 1000 );
		}
	};

	const waitForLatestSiteData = async () => {
		const maxFinishTime = new Date().getTime() + POST_TRANSFER_TIMEOUT_MS;

		while ( true ) {
			const requestedSite = await reduxDispatch< SiteDetails >( requestSite( siteId ) );
			if (
				requestedSite?.options?.is_wpcom_atomic &&
				requestedSite?.capabilities?.manage_options
			) {
				break;
			}

			if ( maxFinishTime < new Date().getTime() ) {
				handleTransferFailure?.( {
					type: 'site_data_timeout',
					error: 'site data did not reflect the transfer in time',
					code: 'site_data_timeout',
				} );
				throw new Error( getTransferFailureMessage( 'timeout' ) );
			}

			await wait( 1000 );
		}
	};

	return {
		waitForInitiateTransfer,
		waitForTransfer,
		waitForFeature,
		waitForLatestSiteData,
	};
};
