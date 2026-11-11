import {
	siteMigrationZendeskTicketQuery,
	cancelSiteMigrationQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { invokeSurvicateEvent } from '@automattic/survicate';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Modal } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import { WhatToExpect } from './what-to-expect';
import { MigrationCard, StatusIcon } from './wordpress/migration-card';
import type { Site } from '@automattic/api-core';

function CancellationModal( {
	site,
	hasTicket,
	onClose,
}: {
	site: Site;
	hasTicket: boolean;
	onClose: () => void;
} ) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const isMigrationInProgress = site.site_migration?.in_progress;
	const mutation = useMutation( cancelSiteMigrationQuery( site.ID ) );

	const modalProps = isMigrationInProgress
		? {
				title: __( 'Request migration cancellation' ),
				description: __(
					'Since your migration is already underway, you’ll need to send us a cancellation request. If you cancel now, you’ll lose all your progress.'
				),
				buttonText: __( 'Cancel migration' ),
			}
		: {
				title: __( 'Cancel migration' ),
				description: hasTicket
					? __(
							'If you cancel now, our Happiness Engineers will be notified that you’ve chosen not to move your site to WordPress.com, and your current site will remain exactly as it is.'
						)
					: __(
							'When you cancel your migration your original site will stay as is. You can always restart the migration when you’re ready.'
						),
				buttonText: hasTicket ? __( 'Send request' ) : __( 'Cancel migration' ),
			};

	const handleConfirmCancel = async () => {
		recordTracksEvent(
			'calypso_dashboard_migration_started_difm_cancellation_modal_confirm_click'
		);
		try {
			await mutation.mutateAsync();
			recordTracksEvent( 'calypso_dashboard_migration_started_difm_cancellation_modal_success' );
			if ( isMigrationInProgress ) {
				createSuccessNotice( __( 'Migration cancellation request sent.' ), { type: 'snackbar' } );
				return;
			}

			await queryClient.invalidateQueries( siteBySlugQuery( site.slug ), { throwOnError: true } );
			createSuccessNotice( __( 'Migration cancelled.' ), { type: 'snackbar' } );
			navigate( { to: '/sites/$siteSlug', params: { siteSlug: site.slug } } );
		} catch {
			recordTracksEvent( 'calypso_dashboard_migration_started_difm_cancellation_modal_failure' );
			createErrorNotice(
				__( 'We couldn’t cancel your migration. Please try again or contact support.' ),
				{ type: 'snackbar' }
			);
		}
	};

	return (
		<Modal title={ modalProps.title } size="medium" onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<Text>{ modalProps.description }</Text>
				<ButtonStack justify="flex-end">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ () => {
							onClose();
							recordTracksEvent(
								'calypso_dashboard_migration_started_difm_cancellation_modal_cancel_click'
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
						{ modalProps.buttonText }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}

export function StartedDIFMContentInfo( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => invokeSurvicateEvent( 'migrationStarted' ), [] );

	const [ isCancellationModalOpen, setIsCancellationModalOpen ] = useState( false );
	const { data: ticketId } = useQuery( {
		...siteMigrationZendeskTicketQuery( site.ID ),
		enabled: ! site.site_migration?.is_complete,
	} );
	const canCancelMigration =
		! site.site_migration?.is_complete && ( ! site.site_migration?.in_progress || !! ticketId );

	return (
		<>
			<MigrationCard
				title={ __( 'We’ve received your migration request' ) }
				description={ __( 'We will review your site to make sure we have everything we need.' ) }
				decoration={ <StatusIcon status="pending" /> }
				note={
					canCancelMigration && (
						<Button
							variant="link"
							className="wordpress-migration__note-link"
							onClick={ () => {
								setIsCancellationModalOpen( true );
								recordTracksEvent( 'calypso_dashboard_migration_started_difm_cancel_click' );
							} }
						>
							{ site.site_migration?.in_progress
								? __( 'Request migration cancellation' )
								: __( 'Cancel migration' ) }
						</Button>
					)
				}
			>
				<WhatToExpect />
			</MigrationCard>
			{ isCancellationModalOpen && (
				<CancellationModal
					site={ site }
					hasTicket={ !! ticketId }
					onClose={ () => setIsCancellationModalOpen( false ) }
				/>
			) }
		</>
	);
}
