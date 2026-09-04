/* eslint-disable no-console */
import config from '@automattic/calypso-config';
import { isTransferringHostedSiteCreationFlow, Step } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseTransferCreatedAt } from 'calypso/components/transfer-wait/transfer-created-at';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { useWaitForAtomic, FailureInfo } from '../../../../hooks/use-wait-for-atomic';
import { ONBOARD_STORE } from '../../../../stores';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

const WaitForAtomic: StepType = function WaitForAtomic( { navigation, data, flow } ) {
	const [ searchParams ] = useSearchParams();
	const { submit } = navigation;
	const {
		setPendingAction,
		setProgress: setProgressAction,
		setTransferStartedAt,
		setTransferStatus,
	} = useDispatch( ONBOARD_STORE );
	const site = useSite();

	let siteId = site?.ID as number;
	// In some cases, we get the siteId from the navigation extra data rather than the SITE_STORE.
	if ( data?.siteId ) {
		siteId = data?.siteId as number;
	}

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

	const { waitForInitiateTransfer, waitForTransfer, waitForFeature, waitForLatestSiteData } =
		useWaitForAtomic( { handleTransferFailure, siteId } );

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		const setProgress = ( progress: number ) => {
			if ( isTransferringHostedSiteCreationFlow( flow ) ) {
				return;
			}

			setProgressAction( progress );
		};

		setPendingAction( async () => {
			setProgress( 10 );
			await waitForInitiateTransfer();
			setProgress( 25 );
			if ( isTransferringHostedSiteCreationFlow( flow ) ) {
				setTransferStatus( null );
				setTransferStartedAt( null );
				await waitForTransfer( {
					// Anchoring on the transfer's own start keeps the elapsed time honest across a
					// reload, where a client-side clock would restart a wait already minutes old.
					onTransferStatusChange: ( status, createdAt ) => {
						setTransferStatus( status );
						if ( createdAt ) {
							const startedAt = parseTransferCreatedAt( createdAt );
							setTransferStartedAt( Number.isNaN( startedAt ) ? null : startedAt );
						}
					},
				} );
			} else {
				await waitForTransfer();
			}
			setProgress( 50 );
			await waitForFeature();
			setProgress( 75 );
			await waitForLatestSiteData();
			setProgress( 100 );

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

	if ( shouldUseStepContainerV2( flow ) ) {
		return <Step.Loading />;
	}

	return null;
};

export default WaitForAtomic;
