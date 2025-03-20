import { LoadingPlaceholder } from '@automattic/components';
import { Button, ClipboardButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmModal from 'calypso/components/confirm-modal';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import Notice from 'calypso/components/notice';
import { useSiteMigrationKey } from 'calypso/landing/stepper/hooks/use-site-migration-key';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { addQueryArgs } from 'calypso/lib/url';
import { getMigrationType } from 'calypso/sites-dashboard/utils';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSiteOption } from 'calypso/state/sites/selectors';
import Cards from '../cards';
import { Container, Header } from '../layout';
import useCancelMigration from './use-cancel-migration';
import type { SiteDetails } from '@automattic/data-stores';

const getContinueMigrationUrl = (
	site: SiteDetails,
	migrationSourceSiteDomain?: string
): string | null => {
	const migrationType = getMigrationType( site );

	const baseQueryArgs = {
		siteId: site.ID,
		siteSlug: site.slug,
		ref: 'hosting-migration-overview',
	};

	if ( migrationType === 'diy' ) {
		if ( migrationSourceSiteDomain ) {
			return addQueryArgs(
				{
					page: 'wpcom-migration',
				},
				migrationSourceSiteDomain + '/wp-admin/admin.php'
			);
		}

		return addQueryArgs(
			baseQueryArgs,
			'/setup/hosted-site-migration/site-migration-instructions'
		);
	}

	return addQueryArgs( baseQueryArgs, '/setup/hosted-site-migration/site-migration-credentials' );
};

export const MigrationPending = ( { site }: { site: SiteDetails } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const migrationType = getMigrationType( site );
	const migrationSourceSiteDomain = useSelector( ( state ) =>
		getSiteOption( state, site.ID, 'migration_source_site_domain' )
	);
	const continueMigrationUrl = getContinueMigrationUrl( site, migrationSourceSiteDomain as string );
	const [ copied, setCopied ] = useState( false );

	// Fetch the migration key.
	const {
		data: { migrationKey } = {},
		error: migrationKeyError,
		status: migrationKeyStatus,
	} = useSiteMigrationKey( site.ID, {
		enabled: true,
		retry: 5,
	} );

	useEffect( () => {
		if ( ! copied ) {
			return;
		}

		const timerId = setTimeout( () => {
			setCopied( () => false );
		}, 2000 );

		return () => clearTimeout( timerId );
	}, [ copied ] );

	const title = translate( 'Your WordPress site is ready to be migrated' );
	const subTitle =
		'diy' === migrationType
			? translate(
					'Complete your migration in the {{strong}}Migrate to WordPress.com{{/strong}} plugin and get ready for unmatched WordPress hosting.',
					{
						components: {
							strong: <strong />,
						},
					}
			  )
			: translate( 'Start your migration today and get ready for unmatched WordPress hosting.' );

	const {
		isModalVisible: isCancellationModalVisible,
		isLoading: isCancelling,
		cancelMigration,
		openModal: openCancellationModal,
		closeModal: closeCancellationModal,
		showErrorNotice: showCancellationErrorNotice,
		dismissErrorNotice: dismissCancellationErrorNotice,
	} = useCancelMigration( site );

	if ( isCancelling ) {
		return (
			<LoadingPlaceholder
				aria-busy
				aria-label="Cancelling migration"
				className="migration-pending__loading-placeholder"
			/>
		);
	}

	const copyMigrationKey = () => {
		if ( ! copied ) {
			setCopied( true );
			recordTracksEvent( 'calypso_migration_hosting_overview_key_copy_clicked', {
				siteId: site.ID,
				siteSlug: site.slug,
				status: migrationKeyStatus,
				error: migrationKeyError,
			} );
		}

		if ( migrationKey && ! migrationKeyError && ! copied ) {
			recordTracksEvent( 'calypso_migration_hosting_overview_key_copy_success' );
			dispatch(
				successNotice( translate( 'Migration key copied to clipboard' ), {
					duration: 3000,
				} )
			);
		} else {
			recordTracksEvent( 'calypso_migration_hosting_overview_key_copy_error', {
				status: migrationKeyStatus,
				error: migrationKeyError,
			} );
			dispatch(
				errorNotice( translate( 'Failed to copy migration key' ), {
					duration: 3000,
				} )
			);
		}
	};

	return (
		<Container>
			<ConfirmModal
				isVisible={ isCancellationModalVisible }
				onCancel={ closeCancellationModal }
				onConfirm={ cancelMigration }
				title={ translate( 'Cancel migration' ) }
				text={ translate(
					"When you cancel your migration your original site will stay as is. You can always restart the migration when you're ready."
				) }
				confirmButtonLabel={ translate( 'Cancel migration' ) }
				cancelButtonLabel={ translate( "Don't cancel migration" ) }
			/>

			{ showCancellationErrorNotice && (
				<Notice status="is-warning" onDismissClick={ dismissCancellationErrorNotice }>
					{ translate(
						'We ran into a problem cancelling your migration. Please try again shortly.'
					) }
				</Notice>
			) }

			<Header title={ title } subTitle={ subTitle }>
				{ continueMigrationUrl && (
					<div className="migration-pending__buttons">
						<HostingHeroButton href={ continueMigrationUrl }>
							{ 'diy' === migrationType
								? translate( 'Complete your migration' )
								: translate( 'Start your migration' ) }
						</HostingHeroButton>
						<div className="migration-pending__secondary-buttons">
							{ 'diy' === migrationType && migrationKey && (
								<>
									<ClipboardButton
										style={ {
											cursor: copied ? 'default' : 'pointer',
											pointerEvents: 'auto',
											textDecoration: 'underline',
											margin: 0,
											padding: 0,
											boxShadow: 'none',
											opacity: copied ? 0.5 : 1,
											outline: 'none',
										} }
										className="migration-pending__copy-key-button"
										onCopy={ copyMigrationKey }
										text={ migrationKey }
									>
										{ translate( 'Copy migration key' ) }
									</ClipboardButton>
									{ ' • ' }
								</>
							) }
							<Button
								variant="link"
								className="migration-pending__cancel-button"
								onClick={ openCancellationModal }
							>
								{ translate( 'Cancel migration' ) }
							</Button>
						</div>
					</div>
				) }
			</Header>
			<Cards />
		</Container>
	);
};
