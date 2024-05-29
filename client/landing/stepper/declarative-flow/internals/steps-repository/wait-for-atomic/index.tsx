/* eslint-disable no-console */
import config from '@automattic/calypso-config';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import type { OnboardSelect, SiteSelect } from '@automattic/data-stores';

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
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const { requestLatestAtomicTransfer, fetchSite } = useDispatch( SITE_STORE );
	const site = useSite();

	let siteId = site?.ID as number;
	// In some cases, we get the siteId from the navigation extra data rather than the SITE_STORE.
	if ( data?.siteId ) {
		siteId = data?.siteId as number;
	}

	const { getSiteLatestAtomicTransfer, getSiteLatestAtomicTransferError, getSite } = useSelect(
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

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		setPendingAction( async () => {
			let startTime = new Date().getTime();
			let totalTimeout = 1000 * 300;
			let maxFinishTime = startTime + totalTimeout;

			// Poll for transfer status
			let stopPollingTransfer = false;

			while ( ! stopPollingTransfer ) {
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

				stopPollingTransfer = transferStatus === transferStates.COMPLETED;
			}

			// Sometimes the transfer is completed but the site capabilities are still out of date.
			// Because Calypso will need these capabilities as soon as this flow is complete, we need to wait until they've been correctly synced.
			// We know the user is the owner of `siteId` because they've just transferred it, so we can wait for `manage_options`.
			// Automattic/dotcom-forge#7464
			let stopPollingForCapabilities = false;

			// We have a shorter timeout while waiting for capabilities and we don't return an error if we hit the timeout.
			// It's not so critical if we don't have the capabilities immediately compared to the site transfer not being complete.
			startTime = new Date().getTime();
			totalTimeout = 1000 * 10;
			maxFinishTime = startTime + totalTimeout;

			while ( ! stopPollingForCapabilities ) {
				if ( maxFinishTime < new Date().getTime() ) {
					break;
				}

				await wait( 500 );
				await fetchSite( siteId );

				const fetchedSite = getSite( siteId );
				stopPollingForCapabilities = Boolean( fetchedSite?.capabilities?.manage_options );
			}

			return { finishedWaitingForAtomic: true, siteId, siteSlug: data?.siteSlug };
		} );

		submit?.();

		// Only trigger when the siteId changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId ] );

	return null;
};

export default WaitForAtomic;
