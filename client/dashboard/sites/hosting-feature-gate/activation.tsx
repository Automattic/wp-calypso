import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { lazy, useEffect, useState, ReactNode, Suspense } from 'react';
import { useAnalytics } from '../../app/analytics';
import type { HostingFeatures } from '../../data/constants';
import type { Site } from '../../data/types';

interface HostingFeatureActivationProps {
	site: Site;
	feature: HostingFeatures;
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
		if ( window.location.pathname.startsWith( '/v2/' ) ) {
			// The current behavior is as follows:
			// - In v2, we're redirecting to the v1 activation flow.
			// - In backported v1, we're async-loading the "calypso/blocks/eligibility-warnings" component.
			//
			// TODO: consolidate the above by porting the component in v2.
			// See: DOTDASH-72

			window.location.href = addQueryArgs( `/hosting-features/${ site.slug }`, {
				activate: true,
			} );
			return;
		}

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

	return (
		<>
			{ renderActivationComponent( { onClick: handleClick } ) }
			{ isModalOpen && (
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
