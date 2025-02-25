import { useDispatch, useSelect } from '@wordpress/data';
import { useSearchParams } from 'react-router-dom';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { useSiteData } from './use-site-data';
import type { SiteSelect, SiteDetails } from '@automattic/data-stores';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
}

export const transferStates = {
	PENDING: 'pending',
	ACTIVE: 'active',
	PROVISIONED: 'provisioned',
	COMPLETED: 'completed',
	ERROR: 'error',
	REVERTED: 'reverted',
	RELOCATING_REVERT: 'relocating_revert',
	RELOCATING_SWITCHEROO: 'relocating_switcheroo',
	REVERTING: 'reverting',
	RENAMING: 'renaming',
	EXPORTING: 'exporting',
	IMPORTING: 'importing',
	CLEANUP: 'cleanup',
} as const;

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

	const waitForInitiateTransfer = async () => {
		const initiateTransferContext = searchParams.get( 'initiate_transfer_context' );
		if ( ! initiateTransferContext ) {
			return;
		}

		await reduxDispatch(
			initiateThemeTransfer(
				siteId,
				null,
				'',
				searchParams.get( 'initiate_transfer_geo_affinity' ) || '',
				initiateTransferContext
			)
		);
	};

	const waitForTransfer = async () => {
		const startTime = new Date().getTime();
		const totalTimeout = 1000 * 300;
		const maxFinishTime = startTime + totalTimeout;

		while ( true ) {
			await wait( 3000 );
			await requestLatestAtomicTransfer( siteId );
			const transfer = getSiteLatestAtomicTransfer( siteId );
			const transferError = getSiteLatestAtomicTransferError( siteId );
			const transferStatus = transfer?.status;
			const isTransferringStatusFailed = transferError && transferError?.status >= 500;

			if ( isTransferringStatusFailed || transferStatus === transferStates.ERROR ) {
				handleTransferFailure?.( {
					type: 'transfer',
					error: transferError?.message || '',
					code: transferError?.code || '',
				} );
				throw new Error( 'transfer error' );
			}

			if ( maxFinishTime < new Date().getTime() ) {
				handleTransferFailure?.( {
					type: 'transfer_timeout',
					error: 'transfer took too long',
					code: 'transfer_timeout',
				} );
				throw new Error( 'transfer timeout' );
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

		while ( true ) {
			const siteFeatures = await reduxDispatch< Promise< { active: string[] } > >(
				fetchSiteFeatures( siteId )
			);
			if ( siteFeatures?.active?.indexOf?.( feature ) >= 0 ) {
				break;
			}

			await wait( 1000 );
		}
	};

	const waitForLatestSiteData = async () => {
		while ( true ) {
			const requestedSite = await reduxDispatch< SiteDetails >( requestSite( siteId ) );
			if (
				requestedSite?.options?.is_wpcom_atomic &&
				requestedSite?.capabilities?.manage_options
			) {
				break;
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
