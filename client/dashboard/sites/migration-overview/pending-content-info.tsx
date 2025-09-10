import {
	deleteSiteMigrationPendingStatusQuery,
	siteMigrationKeyQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	Modal,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
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
import type { MigrationStatus } from '../../utils/site-status';
import type { Site } from '@automattic/api-core';

const GRID_CARDS = [
	{
		title: __( 'Seriously secure' ),
		description: __(
			'Firewalls, encryption, brute force, and DDoS protection. Your security’s all taken care of so you can stay one step ahead of any threats.'
		),
	},
	{
		title: __( 'Unmetered bandwidth' ),
		description: __(
			'With 99.999%% uptime and entirely unmetered bandwidth and traffic on every plan, you’ll never need to worry about being too successful.'
		),
	},
	{
		title: __( 'Power, meet performance' ),
		description: __(
			'Our custom 28+ location CDN and 99.999%% uptime ensure your site is always fast and always available from anywhere in the world.'
		),
	},
	{
		title: __( 'Plugins, themes, and custom code' ),
		description: __(
			'Build anything with full support and automatic updates for 50,000+ plugins and themes. Or start from scratch with your own custom code.'
		),
	},
	{
		title: __( 'Expert support' ),
		description: __(
			'Whenever you’re stuck, whatever you’re trying to make happen – our Happiness Engineers have the answers.'
		),
	},
];

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

function HostingCards() {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const layout = { columns: 3, rows: 2, gap: 4 };

	if ( isSmallViewport ) {
		layout.columns = 1;
		layout.rows = GRID_CARDS.length;
		layout.gap = 4;
	}

	return (
		<Grid { ...layout }>
			{ GRID_CARDS.map( ( card ) => (
				<Card key={ card.title }>
					<CardBody>
						<VStack spacing={ 2 }>
							<Text as="p" size="15px" weight={ 500 } lineHeight="20px">
								{ card.title }
							</Text>
							<Text as="p" variant="muted">
								{ card.description }
							</Text>
						</VStack>
					</CardBody>
				</Card>
			) ) }
		</Grid>
	);
}

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
					<Button variant="primary" isBusy={ mutation.isPending } onClick={ handleConfirmCancel }>
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
	const { data: migrationKey } = useSuspenseQuery( siteMigrationKeyQuery( site.ID ) );
	const [ isCancellationModalOpen, setIsCancellationModalOpen ] = useState( false );
	const continueMigrationUrl = getContinueMigrationUrl( site );

	return (
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
			{ isCancellationModalOpen && (
				<CancellationModal site={ site } onClose={ () => setIsCancellationModalOpen( false ) } />
			) }
		</VStack>
	);
}
