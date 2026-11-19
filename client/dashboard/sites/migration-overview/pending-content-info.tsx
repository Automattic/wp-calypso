import { deleteSiteMigrationPendingStatusQuery } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Modal } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import { wpcomLink } from '../../utils/link';
import { HostingCards } from './hosting-cards';
import { MigrationCard, StatusIcon } from './wordpress/migration-card';
import type { Site } from '@automattic/api-core';

// Only DIFM migrations from before the assisted hand-off still reach this view.
const getContinueMigrationUrl = ( site: Site ) =>
	addQueryArgs( wpcomLink( '/setup/site-migration/site-migration-credentials' ), {
		siteId: site.ID,
		siteSlug: site.slug,
		ref: 'hosting-migration-overview',
	} );

function CancellationModal( { site, onClose }: { site: Site; onClose: () => void } ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );
	const mutation = useMutation( deleteSiteMigrationPendingStatusQuery( site.ID ) );

	const handleConfirmCancel = () => {
		recordTracksEvent( 'calypso_dashboard_migration_in_progress_cancellation_modal_confirm_click' );
		mutation.mutate( undefined, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_migration_in_progress_cancellation_modal_success' );
				navigate( { to: '/sites/$siteSlug', params: { siteSlug: site.slug } } );
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_dashboard_migration_in_progress_cancellation_modal_failure' );
				createErrorNotice( error.message, { type: 'snackbar' } );
			},
		} );
	};

	return (
		<Modal title={ __( 'Cancel migration' ) } size="medium" onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<Text>
					{ __(
						'When you cancel your migration your original site will stay as is. You can always restart the migration when you’re ready.'
					) }
				</Text>
				<ButtonStack justify="flex-end">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ () => {
							onClose();
							recordTracksEvent(
								'calypso_dashboard_migration_in_progress_cancellation_modal_cancel_click'
							);
						} }
					>
						{ __( 'Don’t cancel migration' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ mutation.isPending }
						onClick={ handleConfirmCancel }
					>
						{ __( 'Cancel migration' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}

export function PendingContentInfo( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isCancellationModalOpen, setIsCancellationModalOpen ] = useState( false );

	return (
		<>
			<VStack spacing={ 6 }>
				<MigrationCard
					title={ __( 'Your WordPress site is ready to be migrated' ) }
					description={ __(
						'Start your migration today and get ready for unmatched WordPress hosting.'
					) }
					decoration={ <StatusIcon status="pending" /> }
					actions={
						<>
							<Button
								__next40pxDefaultSize
								href={ getContinueMigrationUrl( site ) }
								variant="primary"
							>
								{ __( 'Start your migration' ) }
							</Button>
							<Button
								variant="link"
								onClick={ () => {
									setIsCancellationModalOpen( true );
									recordTracksEvent( 'calypso_dashboard_migration_in_progress_cancel_click' );
								} }
							>
								{ __( 'Cancel migration' ) }
							</Button>
						</>
					}
				/>
				<HostingCards />
			</VStack>
			{ isCancellationModalOpen && (
				<CancellationModal site={ site } onClose={ () => setIsCancellationModalOpen( false ) } />
			) }
		</>
	);
}
