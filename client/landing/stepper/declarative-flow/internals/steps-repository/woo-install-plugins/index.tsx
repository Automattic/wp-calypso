/* eslint-disable no-console */
import config from '@automattic/calypso-config';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';
import type { AtomicSoftwareStatus } from 'calypso/../packages/data-stores/src/site';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
}

const WooInstallPlugins: Step = function WooInstallPlugins( { navigation } ) {
	const { submit } = navigation;
	const { setPendingAction, setProgressTitle, setProgress } = useDispatch( ONBOARD_STORE );
	const { initiateSoftwareInstall, requestAtomicSoftwareStatus } = useDispatch( SITE_STORE );
	const { getAtomicSoftwareInstallError, getAtomicSoftwareStatus, getAtomicSoftwareError } =
		useSelect( ( select ) => select( SITE_STORE ) );
	const site = useSite();
	const softwareSet = 'woo-on-plans';

	const handleTransferFailure = ( failureInfo: FailureInfo ) => {
		recordTracksEvent( 'calypso_woocommerce_dashboard_snag_error', {
			action: failureInfo.type,
			site: site?.URL,
			code: failureInfo.code,
			error: failureInfo.error,
		} );

		logToLogstash( {
			feature: 'calypso_client',
			message: failureInfo.error,
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			blog_id: site?.ID,
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
		if ( ! site?.ID ) return;

		setPendingAction( async () => {
			setProgressTitle( 'Installing WooCommerce' );
			setProgress( 0 );
			initiateSoftwareInstall( site.ID, softwareSet );

			const timeoutMs = 1000 * 60 * 3;
			const maxFinishTime = new Date().getTime() + timeoutMs;

			let status: AtomicSoftwareStatus | undefined;
			let currentProgress = 0;
			const expectedStepCount = 5;
			const progressStep = 1 / expectedStepCount;
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

			setProgress( 1 );
		} );

		submit?.();
	}, [] );

	return null;
};

export default WooInstallPlugins;
