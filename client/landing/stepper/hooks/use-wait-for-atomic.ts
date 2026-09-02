import { useDispatch, useSelect } from '@wordpress/data';
import { useSearchParams } from 'react-router-dom';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import {
	createRevertedTransferWatcher,
	getTransferFailureMessage,
	transferStates,
} from '../utils/atomic-transfer-outcome';
import { useSiteData } from './use-site-data';
import type { SiteSelect, SiteDetails } from '@automattic/data-stores';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

// The transfer itself is bounded below (300s); these bound the shorter phases that run after it.
const POST_TRANSFER_TIMEOUT_MS = 1000 * 180;
const MAX_FEATURE_FETCH_FAILURES = 5;

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
}

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
	}: {
		onTransferStatusChange?: ( status: string | null ) => void;
	} = {} ) => {
		const startTime = new Date().getTime();
		const totalTimeout = 1000 * 300;
		const maxFinishTime = startTime + totalTimeout;
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		while ( true ) {
			await wait( 3000 );
			await requestLatestAtomicTransfer( siteId );
			const transfer = getSiteLatestAtomicTransfer( siteId );
			const transferStatus = transfer?.status ?? null;
			onTransferStatusChange?.( transferStatus );
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

			if ( maxFinishTime < new Date().getTime() ) {
				handleTransferFailure?.( {
					type: 'transfer_timeout',
					error: 'transfer took too long',
					code: 'transfer_timeout',
				} );
				throw new Error( getTransferFailureMessage( 'timeout' ) );
			}

			if ( transferStatus === transferStates.COMPLETED ) {
				break;
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
