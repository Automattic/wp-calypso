/* eslint-disable no-console */
import config from '@automattic/calypso-config';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSitePluginSlug } from 'calypso/landing/stepper/hooks/use-site-plugin-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { useBundleSettings } from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import type { AtomicSoftwareStatus, OnboardSelect, SiteSelect } from '@automattic/data-stores';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
}

const BundleInstallPlugins: Step = function BundleInstallPlugins( { navigation } ) {
	const { submit } = navigation;
	const { setPendingAction, setProgressTitle, setProgress } = useDispatch( ONBOARD_STORE );
	const { initiateSoftwareInstall, requestAtomicSoftwareStatus } = useDispatch( SITE_STORE );
	const { getAtomicSoftwareInstallError, getAtomicSoftwareStatus, getAtomicSoftwareError } =
		useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
	const site = useSite();
	const softwareSet = useSitePluginSlug();
	const bundleSettings = useBundleSettings( softwareSet );
	const translate = useTranslate();
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
			blog_id: site?.ID,
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
		if ( ! site?.ID ) {
			return;
		}

		setPendingAction( async () => {
			// translators: %(softwareName)s is the software name that is being installed.
			const title = translate( 'Installing %(softwareName)s', {
				args: {
					softwareName: bundleSettings?.softwareName || '',
				},
			} );

			setProgressTitle( title );
			setProgress( 0 );
			initiateSoftwareInstall( site.ID, softwareSet );

			const timeoutMs = 1000 * 60 * 3;
			const maxFinishTime = new Date().getTime() + timeoutMs;

			let status: AtomicSoftwareStatus | undefined;
			let currentProgress = 0;
			const expectedStepCount = 5;
			const progressStep = 100 / expectedStepCount;
			while ( ! status?.applied ) {
				if ( maxFinishTime < new Date().getTime() ) {
					handleTransferFailure( {
						type: 'transfer_timeout',
						error: 'transfer took too long',
						code: 'transfer_timeout',
					} );
					throw new Error( 'transfer timeout' );
				}

				requestAtomicSoftwareStatus( site.ID, softwareSet );

				await wait( 3000 );

				// Error making the request to install the software.
				const installError = getAtomicSoftwareInstallError( site.ID, softwareSet );
				// There was something wrong with the installation.
				const statusError = getAtomicSoftwareError( site.ID, softwareSet );

				if ( statusError || installError ) {
					const error = statusError ? statusError : installError!;
					handleTransferFailure( {
						type: error.name,
						code: error.code,
						error: error.message,
					} );
					throw new Error( 'Transfer error' );
				}

				status = getAtomicSoftwareStatus( site.ID, softwareSet );
				currentProgress += progressStep;
				setProgress( currentProgress );
			}

			setProgress( 100 );
		} );

		submit?.();
	}, [] );

	return null;
};

export default BundleInstallPlugins;
