import { siteAutomatedTransfersEligibilityQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text, Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { getCurrentDashboard } from '../../app/routing';
import { Callout } from '../../components/callout';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import HostingFeatureActivationModal from '../hosting-feature-activation-modal';
import HostingFeatureList from '../hosting-feature-list';
import illustrationUrl from './upsell-illustration.svg';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

const EligibilityWarnings = lazy( () => import( 'calypso/blocks/eligibility-warnings' ) );

interface ActivationCalloutProps {
	site: Site;
	feature: HostingFeatureSlug;
	tracksFeatureId: string;
}

export default function ActivationCallout( {
	site,
	feature,
	tracksFeatureId,
}: ActivationCalloutProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const isBackport = isDashboardBackport();

	// Resolve eligibility up front so a click can skip the modal when there is
	// nothing to surface. The modal reuses this cached query, so it also opens
	// instantly when it is shown.
	const { data: eligibility } = useQuery( siteAutomatedTransfersEligibilityQuery( site.ID ) );

	const hasErrors = ( eligibility?.errors.length ?? 0 ) > 0;

	// The modal only has something to show when there are blocking errors or
	// warnings to surface. A cleanly eligible site can start the transfer
	// directly, using the optimal (default) data center. The backport modal
	// keeps its existing behavior.
	const canStartTransferDirectly =
		! isBackport &&
		!! eligibility &&
		eligibility.is_eligible &&
		eligibility.errors.length === 0 &&
		Object.values( eligibility.warnings ).flat().length === 0;

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_activation_impression', {
			feature_id: tracksFeatureId,
		} );
	}, [ recordTracksEvent, tracksFeatureId ] );

	const handleConfirm = ( options: { geo_affinity?: string } ) => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_activation_confirm', {
			feature_id: tracksFeatureId,
		} );

		window.location.href = addQueryArgs( wpcomLink( '/setup/transferring-hosted-site' ), {
			siteId: String( site.ID ),
			feature,
			initiate_transfer_context: 'hosting',
			initiate_transfer_geo_affinity: options.geo_affinity || '',
			redirect_to: redirectToDashboardLink( { supportBackport: true } ),
			dashboard: getCurrentDashboard(),
		} );
	};

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_activation_click', {
			feature_id: tracksFeatureId,
			show_modal: ! canStartTransferDirectly,
		} );

		if ( canStartTransferDirectly ) {
			handleConfirm( {} );
			return;
		}

		setIsModalOpen( true );
	};

	const renderActivationModal = () => {
		if ( ! isModalOpen ) {
			return null;
		}

		if ( isBackport ) {
			return (
				<Suspense fallback={ null }>
					<Modal
						className="hosting-feature-activation-modal"
						title={ __( 'One more step' ) }
						onRequestClose={ () => setIsModalOpen( false ) }
						size="medium"
					>
						<EligibilityWarnings
							onDismiss={ () => setIsModalOpen( false ) }
							onProceed={ handleConfirm }
							showDataCenterPicker
							standaloneProceed
							currentContext="hosting-features"
							atomicTransferAction="hosting-features"
						/>
					</Modal>
				</Suspense>
			);
		}

		return (
			<Suspense fallback={ null }>
				<Modal
					className="hosting-feature-activation-modal"
					title={ hasErrors ? __( 'Hosting features cannot be activated' ) : __( 'One more step' ) }
					onRequestClose={ () => setIsModalOpen( false ) }
					size="medium"
				>
					<HostingFeatureActivationModal siteId={ site.ID } onProceed={ handleConfirm } />
				</Modal>
			</Suspense>
		);
	};

	const callout = (
		<Callout
			image={ illustrationUrl }
			title={ __( 'Activate hosting features' ) }
			description={
				<>
					<Text variant="muted">
						{ __(
							'Your plan includes a range of powerful hosting features. Activate them to get started.'
						) }
					</Text>

					<HostingFeatureList site={ site } />
				</>
			}
			actions={
				<Button variant="primary" size="compact" onClick={ handleClick }>
					{ __( 'Activate' ) }
				</Button>
			}
		/>
	);

	return (
		<>
			{ callout }
			{ renderActivationModal() }
		</>
	);
}
