/* eslint-disable no-console */
import config from '@automattic/calypso-config';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSitePluginSlug } from 'calypso/landing/stepper/hooks/use-site-plugin-slug';
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

const BundleTransfer: Step = function BundleTransfer( { navigation } ) {
	const { submit } = navigation;
	const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
	const { requestAtomicSoftwareStatus, requestLatestAtomicTransfer, initiateAtomicTransfer } =
		useDispatch( SITE_STORE );
	const site = useSite();

	const siteId = site?.ID;

	const pluginSlug = useSitePluginSlug();

	const {
		getSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError,
		getAtomicSoftwareStatus,
		getAtomicSoftwareError,
	} = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
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
			setProgress( 0 );

			const startTime = new Date().getTime();
			const totalTimeout = 1000 * 180;
			const maxFinishTime = startTime + totalTimeout;
			const maxRetry = 3;

			// Initiate transfer
			await initiateAtomicTransfer( siteId, pluginSlug );

			// Poll for transfer status
			let stopPollingTransfer = false;

			while ( ! stopPollingTransfer ) {
				await wait( 3000 );
				await requestLatestAtomicTransfer( siteId );
				const transfer = getSiteLatestAtomicTransfer( siteId );
				const transferError = getSiteLatestAtomicTransferError( siteId );
				const transferStatus = transfer?.status;
				const isTransferringStatusFailed = transferError && transferError?.status >= 500;

				switch ( transferStatus ) {
					case transferStates.PENDING:
						setProgress( 0.2 );
						break;
					case transferStates.ACTIVE:
						setProgress( 0.4 );
						break;
					case transferStates.PROVISIONED:
						setProgress( 0.5 );
						break;
					case transferStates.COMPLETED:
						setProgress( 0.7 );
						break;
				}

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

			// Poll for software status
			let stopPollingSoftware = false;
			let pollingSoftwareRetry = 0;

			while ( ! stopPollingSoftware ) {
				await requestAtomicSoftwareStatus( siteId, pluginSlug );
				const softwareStatus = getAtomicSoftwareStatus( siteId, pluginSlug );

				const softwareError = getAtomicSoftwareError( siteId, pluginSlug );
				if ( softwareError ) {
					if ( pollingSoftwareRetry < maxRetry ) {
						pollingSoftwareRetry++;
					} else {
						handleTransferFailure( {
							type: 'software_install',
							error: softwareError.message || '',
							code: softwareError.status || '',
						} );
						throw new Error( 'software install error' );
					}
				}

				if ( maxFinishTime < new Date().getTime() ) {
					handleTransferFailure( {
						type: 'software_install_timeout',
						error: 'software install took too long',
						code: 'transfer_timeout',
					} );
					throw new Error( 'software_install timeout' );
				}

				stopPollingSoftware = !! softwareStatus?.applied;

				if ( ! stopPollingSoftware ) {
					await wait( 3000 );
				}
			}
			setProgress( 1 );
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId ] );

	return null;
};

export default BundleTransfer;
