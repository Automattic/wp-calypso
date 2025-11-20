import { siteMigrationZendeskTicketQuery, cancelSiteMigrationQuery } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Icon,
	Modal,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { globe, group, scheduled } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { Fragment, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardDivider } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import { Text } from '../../components/text';
import type { Site } from '@automattic/api-core';

const GUIDE_LIST = [
	{
		icon: group,
		text: __( 'We’ll bring over a copy of your site, without affecting the current live version.' ),
	},
	{
		icon: scheduled,
		text: __( 'You’ll get an update on the progress of your migration within 2–3 business days.' ),
	},
	{
		icon: globe,
		text: __( 'We’ll help you switch your domain over after the migration’s completed.' ),
	},
];

function CancellationModal( { site, onClose }: { site: Site; onClose: () => void } ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const mutation = useMutation( cancelSiteMigrationQuery( site.ID ) );
	const isMigrationInProgress = site.site_migration?.in_progress;

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
				description: __(
					'If you cancel now, our Happiness Engineers will be notified that you’ve chosen not to move your site to WordPress.com, and your current site will remain exactly as it is.'
				),
				buttonText: __( 'Send request' ),
		  };

	const handleConfirmCancel = () => {
		recordTracksEvent(
			'calypso_dashboard_migration_started_difm_cancellation_modal_confirm_click'
		);
		mutation.mutate( undefined, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_migration_started_difm_cancellation_modal_success' );
				if ( isMigrationInProgress ) {
					createSuccessNotice( __( 'Migration cancellation request sent.' ), { type: 'snackbar' } );
					return;
				}

				createSuccessNotice( __( 'Migration cancelled.' ), { type: 'snackbar' } );
				navigate( { to: '/sites/$siteSlug', params: { siteSlug: site.slug } } );
			},
			onError: () => {
				recordTracksEvent( 'calypso_dashboard_migration_started_difm_cancellation_modal_failure' );
				createErrorNotice(
					__( 'We couldn’t cancel your migration. Our support team will reach out to help.' ),
					{ type: 'snackbar' }
				);
			},
		} );
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
	const [ isCancellationModalOpen, setIsCancellationModalOpen ] = useState( false );
	const { data: ticketId } = useQuery( {
		...siteMigrationZendeskTicketQuery( site.ID ),
		enabled: ! site.site_migration?.is_complete,
	} );

	return (
		<>
			<VStack spacing={ 8 } expanded={ false }>
				<PageHeader
					title={ __( 'We’ve received your migration request' ) }
					description={ __(
						'We will review your site to make sure we have everything we need. Here’s what you can expect next:'
					) }
				/>
				<Card size="small">
					{ GUIDE_LIST.map( ( item, index ) => (
						<Fragment key={ index }>
							<CardBody>
								<HStack justify="flex-start">
									<Icon icon={ item.icon } />
									<Text>{ item.text }</Text>
								</HStack>
							</CardBody>
							{ index < GUIDE_LIST.length - 1 && <CardDivider /> }
						</Fragment>
					) ) }
				</Card>
				{ ticketId && (
					<ButtonStack justify="flex-start">
						<Button
							variant="link"
							onClick={ () => {
								setIsCancellationModalOpen( true );
								recordTracksEvent( 'calypso_dashboard_migration_started_difm_cancel_click' );
							} }
						>
							{ site.site_migration?.in_progress
								? __( 'Request migration cancellation' )
								: __( 'Cancel migration' ) }
						</Button>
					</ButtonStack>
				) }
			</VStack>
			{ isCancellationModalOpen && (
				<CancellationModal site={ site } onClose={ () => setIsCancellationModalOpen( false ) } />
			) }
		</>
	);
}
