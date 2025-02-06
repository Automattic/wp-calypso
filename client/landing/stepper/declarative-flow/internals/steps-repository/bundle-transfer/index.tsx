/* eslint-disable no-console */
import config from '@automattic/calypso-config';
import { isNewSiteMigrationFlow } from '@automattic/onboarding';
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

const BundleTransfer: Step = function BundleTransfer( { navigation, flow } ) {
	const { submit } = navigation;
	const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
	const { requestAtomicSoftwareStatus, requestLatestAtomicTransfer, initiateAtomicTransfer } =
		useDispatch( SITE_STORE );
	const site = useSite();

	const siteId = site?.ID;

	const softwareSet = useSitePluginSlug();

	const {
		getSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError,
		getAtomicSoftwareStatus,
		getAtomicSoftwareError,
	} = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
	const { getIntent } = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] );

	const handleTransferFailure = ( failureInfo: FailureInfo ) => {
		const eventProperties = {
			action: failureInfo.type,
			site: site?.URL,
			code: failureInfo.code,
			error: failureInfo.error,
			intent: getIntent(),
		};

		const logstashProperties = {
			feature: 'calypso_client' as 'calypso_client' | 'calypso_ssr',
			message: failureInfo.error,
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			blog_id: siteId,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_bundle_dashboard_snag_error',
				action: failureInfo.type,
				site: site?.URL,
				code: failureInfo.code,
			},
		};

		recordTracksEvent( 'calypso_bundle_dashboard_snag_error', {
			...eventProperties,
			software_set: softwareSet,
		} );

		logToLogstash( {
			...logstashProperties,
			properties: { ...logstashProperties.properties, software_set: softwareSet },
		} );

		// For backward compatibility with existing event. When it's not used anymore, it can be removed.
		if ( 'woo-on-plans' === softwareSet ) {
			recordTracksEvent( 'calypso_woocommerce_dashboard_snag_error', eventProperties );

			logToLogstash( {
				...logstashProperties,
				properties: {
					...logstashProperties.properties,
					type: 'calypso_woocommerce_dashboard_snag_error',
				},
			} );
		}
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

			await requestLatestAtomicTransfer( siteId );
			const preTransferCheck = getSiteLatestAtomicTransfer( siteId );

			// Ensure we don't have an existing transfer in progress before starting a new one.
			if ( preTransferCheck?.status !== transferStates.ACTIVE ) {
				// Initiate transfer
				const transferIntent = isNewSiteMigrationFlow( flow ) ? 'migrate' : undefined;
				await initiateAtomicTransfer( siteId, softwareSet, transferIntent );
			}

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
						setProgress( 20 );
						break;
					case transferStates.ACTIVE:
						setProgress( 40 );
						break;
					case transferStates.PROVISIONED:
						setProgress( 50 );
						break;
					case transferStates.COMPLETED:
						setProgress( 70 );
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

			// If we have a valid software-set, poll for software status
			let stopPollingSoftware = ! softwareSet;
			let pollingSoftwareRetry = 0;

			while ( ! stopPollingSoftware ) {
				await requestAtomicSoftwareStatus( siteId, softwareSet );
				const softwareStatus = getAtomicSoftwareStatus( siteId, softwareSet );

				const softwareError = getAtomicSoftwareError( siteId, softwareSet );
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
			setProgress( 100 );
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId ] );

	return null;
};

export default BundleTransfer;
