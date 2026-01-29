import { __experimentalText as Text, Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { getCurrentDashboard, redirectToDashboardLink, wpcomLink } from '../../utils/link';
import HostingFeatureActivationModal from '../hosting-feature-activation-modal';
import HostingFeatureList from '../hosting-feature-list';
import illustrationUrl from './upsell-illustration.svg';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

const EligibilityWarnings = lazy( () => import( 'calypso/blocks/eligibility-warnings' ) );

interface ActivationCalloutProps {
	site: Site;
	main?: ReactNode;
	feature: HostingFeatureSlug;
	tracksFeatureId: string;
}

export default function ActivationCallout( {
	site,
	main,
	feature,
	tracksFeatureId,
}: ActivationCalloutProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_activation_impression', {
			feature_id: tracksFeatureId,
		} );
	}, [ recordTracksEvent, tracksFeatureId ] );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_activation_click', {
			feature_id: tracksFeatureId,
		} );

		setIsModalOpen( true );
	};

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

	const renderActivationModal = () => {
		const isBackport = isDashboardBackport();
		if ( ! isModalOpen ) {
			return null;
		}

		if ( isBackport ) {
			return (
				<Suspense fallback={ null }>
					<Modal
						title={ __( 'Before you continue' ) }
						onRequestClose={ () => setIsModalOpen( false ) }
						size="medium"
					>
						<EligibilityWarnings
							onDismiss={ () => setIsModalOpen( false ) }
							onProceed={ handleConfirm }
							showDataCenterPicker
							standaloneProceed
							currentContext="hosting-features"
						/>
					</Modal>
				</Suspense>
			);
		}

		return (
			<Suspense fallback={ null }>
				<Modal
					title={ __( 'Before you continue' ) }
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

	let content = callout;
	if ( main ) {
		content = <CalloutOverlay callout={ callout } main={ main } />;
	}

	return (
		<>
			{ content }
			{ renderActivationModal() }
		</>
	);
}
