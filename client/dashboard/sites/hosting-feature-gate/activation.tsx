import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { lazy, useEffect, useState, ReactNode, Suspense } from 'react';
import { useAnalytics } from '../../app/analytics';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import HostingFeatureActivationModal from '../hosting-feature-activation-modal';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

interface HostingFeatureActivationProps {
	site: Site;
	feature: HostingFeatureSlug;
	tracksFeatureId: string;
	renderActivationComponent: ( { onClick }: { onClick: () => void } ) => ReactNode;
}

const EligibilityWarnings = lazy( () => import( 'calypso/blocks/eligibility-warnings' ) );

export default function HostingFeatureActivation( {
	site,
	feature,
	tracksFeatureId,
	renderActivationComponent,
}: HostingFeatureActivationProps ) {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const { recordTracksEvent } = useAnalytics();

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

		window.location.href = addQueryArgs( '/setup/transferring-hosted-site', {
			siteId: String( site.ID ),
			feature,
			initiate_transfer_context: 'hosting',
			initiate_transfer_geo_affinity: options.geo_affinity || '',
			redirect_to: window.location.href.replace( window.location.origin, '' ),
		} );
	};

	const isBackport = isDashboardBackport();

	return (
		<>
			{ renderActivationComponent( { onClick: handleClick } ) }

			{ ! isBackport && isModalOpen && (
				<Suspense fallback={ null }>
					<Modal
						title={ __( 'Before you continue' ) }
						onRequestClose={ () => setIsModalOpen( false ) }
						size="medium"
					>
						<HostingFeatureActivationModal siteId={ site.ID } onProceed={ handleConfirm } />
					</Modal>
				</Suspense>
			) }

			{ isBackport && isModalOpen && (
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
			) }
		</>
	);
}
