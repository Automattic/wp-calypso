import { __experimentalText as Text, Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { useAnalytics } from '../../app/analytics';
import { Callout } from '../../components/callout';
import { HostingFeatures } from '../features';
import illustrationUrl from './activation-illustration.svg';
import type { Site } from '../../data/types';

interface HostingFeatureActivationProps {
	site: Site;
	feature: HostingFeatures;
	tracksFeatureId: string;
}

export default function HostingFeatureActivation( {
	site,
	feature,
	tracksFeatureId,
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

						<ul style={ { paddingInlineStart: '15px', margin: 0 } }>
							<Text as="li" variant="muted">
								{ __( 'Git-based deployments' ) }
							</Text>
							<Text as="li" variant="muted">
								{ __( 'Server monitoring' ) }
							</Text>
							<Text as="li" variant="muted">
								{ __( 'Access and error logs' ) }
							</Text>
							<Text as="li" variant="muted">
								{ __( 'Secure access via SFTP/SSH' ) }
							</Text>
							<Text as="li" variant="muted">
								{ __( 'Advanced server settings' ) }
							</Text>
						</ul>
					</>
				}
				actions={
					<Button variant="primary" size="compact" onClick={ handleClick }>
						{ __( 'Activate' ) }
					</Button>
				}
			/>
			{ isModalOpen && (
				<Modal
					title={ __( 'Before you continue' ) }
					onRequestClose={ () => setIsModalOpen( false ) }
					size="medium"
				>
					<AsyncLoad
						require="calypso/blocks/eligibility-warnings"
						placeholder={ null }
						onDismiss={ () => setIsModalOpen( false ) }
						onProceed={ handleConfirm }
						showDataCenterPicker
						standaloneProceed
						currentContext="hosting-features"
					/>
				</Modal>
			) }
		</>
	);
}
