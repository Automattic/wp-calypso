/* eslint-disable no-console */
import config from '@automattic/calypso-config';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import type { OnboardSelect, SiteSelect, SiteDetails } from '@automattic/data-stores';

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

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const WaitForAtomic: Step = function WaitForAtomic( { navigation, data } ) {
	const [ searchParams ] = useSearchParams();
	const reduxDispatch = useReduxDispatch();
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );
	const site = useSite();

	let siteId = site?.ID as number;
	// In some cases, we get the siteId from the navigation extra data rather than the SITE_STORE.
	if ( data?.siteId ) {
		siteId = data?.siteId as number;
	}

	const { getSiteLatestAtomicTransfer, getSiteLatestAtomicTransferError } = useSelect(
		( select ) => select( SITE_STORE ) as SiteSelect,
		[]
	);
	const { getIntent } = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] );

	const handleTransferFailure = ( failureInfo: FailureInfo ) => {
		recordTracksEvent( 'calypso_woocommerce_dashboard_snag_error', {
			action: failureInfo.type,
			site: site?.URL,
			code: failureInfo.code,
			error: failureInfo.error,
			intent: getIntent(),
		} );

		logToLogstash( {
			feature: 'calypso_client',
			message: failureInfo.error,
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			blog_id: siteId,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_woocommerce_dashboard_snag_error',
				action: failureInfo.type,
				site: site?.URL,
				code: failureInfo.code,
			},
		} );
	};

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
				handleTransferFailure( {
					type: 'transfer',
					error: transferError?.message || '',
					code: transferError?.code || '',
				} );
				throw new Error( 'transfer error' );
			}

			if ( maxFinishTime < new Date().getTime() ) {
				handleTransferFailure( {
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

	// Request the site features to ensure the specific feature is active.
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

	// Request the latest site data to ensure the value of the `is_wpcom_atomic` and `manage_options` are true.
	const waitForLatestSiteData = async () => {
		while ( true ) {
			const site = await reduxDispatch< SiteDetails >( requestSite( siteId ) );
			if ( site?.options?.is_wpcom_atomic && site?.capabilities?.manage_options ) {
				break;
			}

			await wait( 1000 );
		}
	};

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		setPendingAction( async () => {
			await waitForInitiateTransfer();
			await waitForTransfer();
			await waitForFeature();
			await waitForLatestSiteData();

			return {
				finishedWaitingForAtomic: true,
				siteId,
				siteSlug: data?.siteSlug,
				redirectTo: searchParams.get( 'redirect_to' ),
			};
		} );

		submit?.();

		// Only trigger when the siteId changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId ] );

	return null;
};

export default WaitForAtomic;
