import {
	deleteSiteMigrationPendingStatusQuery,
	siteMigrationKeyQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import { Text } from '../../components/text';
import { getSiteMigrationState } from '../../utils/site-status';
import { HostingCards } from './hosting-cards';
import type { MigrationStatus } from '../../utils/site-status';
import type { Site } from '@automattic/api-core';

const getContinueMigrationUrl = ( site: Site ): string | null => {
	const migrationState = getSiteMigrationState( site );
	const sourceSiteDomain = site.options?.migration_source_site_domain;

	const queryArgs = {
		siteId: site.ID,
		siteSlug: site.slug,
		ref: 'hosting-migration-overview',
	};

	if ( migrationState?.type === 'diy' ) {
		if ( sourceSiteDomain ) {
			const url = sourceSiteDomain.endsWith( '/' ) ? sourceSiteDomain : sourceSiteDomain + '/';
			return addQueryArgs( `${ url }wp-admin/admin.php`, { page: 'wpcom-migration' } );
		}

		return addQueryArgs( '/setup/site-migration/site-migration-instructions', queryArgs );
	}

	return addQueryArgs( '/setup/site-migration/site-migration-credentials', queryArgs );
};

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

export function PendingContentInfo( {
	site,
	type,
}: {
	site: Site;
	type: MigrationStatus[ 'type' ];
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { data: migrationKey, isLoading } = useQuery( siteMigrationKeyQuery( site.ID ) );
	const [ isCancellationModalOpen, setIsCancellationModalOpen ] = useState( false );
	const continueMigrationUrl = getContinueMigrationUrl( site );

	if ( isLoading ) {
		return null;
	}

	return (
		<>
			<VStack spacing={ 8 }>
				<PageHeader
					title={ __( 'Your WordPress site is ready to be migrated' ) }
					description={
						type === 'diy'
							? createInterpolateElement(
									__(
										'Get ready for unmatched WordPress hosting. Use your migration key to complete your migration in the <em>Migrate to WordPress.com</em> plugin.'
									),
									{
										em: <em />,
									}
							  )
							: __( 'Start your migration today and get ready for unmatched WordPress hosting.' )
					}
				/>
				{ continueMigrationUrl && (
					<HStack justify="flex-start">
						<ButtonStack justify="flex-start" expanded={ false }>
							{ type === 'diy' && migrationKey && (
								<Button
									variant="secondary"
									onClick={ () => {
										navigator.clipboard.writeText( migrationKey );
										recordTracksEvent( 'calypso_dashboard_migration_in_progress_copy_key_click' );
										createSuccessNotice( __( 'Migration key copied successfully.' ), {
											type: 'snackbar',
										} );
									} }
								>
									{ __( 'Copy migration key' ) }
								</Button>
							) }
							<Button href={ continueMigrationUrl } variant="primary">
								{ type === 'diy' ? __( 'Complete migration' ) : __( 'Start your migration' ) }
							</Button>
						</ButtonStack>
						<Text as="p" variant="muted">
							{ createInterpolateElement( __( 'or <button>cancel migration</button>.' ), {
								button: (
									<Button
										variant="link"
										onClick={ () => {
											setIsCancellationModalOpen( true );
											recordTracksEvent( 'calypso_dashboard_migration_in_progress_cancel_click' );
										} }
									/>
								),
							} ) }
						</Text>
					</HStack>
				) }
				<HostingCards />
			</VStack>
			{ isCancellationModalOpen && (
				<CancellationModal site={ site } onClose={ () => setIsCancellationModalOpen( false ) } />
			) }
		</>
	);
}
