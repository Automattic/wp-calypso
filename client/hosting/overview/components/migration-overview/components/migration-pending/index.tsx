import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import ConfirmModal from 'calypso/components/confirm-modal';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import Notice from 'calypso/components/notice';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { useSiteExcerptsQueryInvalidator } from 'calypso/data/sites/use-site-excerpts-query';
import { addQueryArgs } from 'calypso/lib/url';
import { getMigrationType } from 'calypso/sites-dashboard/utils';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import Cards from '../cards';
import { Container, Header } from '../layout';
import type { SiteDetails } from '@automattic/data-stores';

const getContinueMigrationUrl = ( site: SiteDetails ): string | null => {
	const migrationType = getMigrationType( site );

	const baseQueryArgs = {
		siteId: site.ID,
		siteSlug: site.slug,
		ref: 'hosting-migration-overview',
	};

	if ( migrationType === 'diy' ) {
		return addQueryArgs(
			baseQueryArgs,
			'/setup/hosted-site-migration/site-migration-instructions'
		);
	}

	return addQueryArgs( baseQueryArgs, '/setup/hosted-site-migration/site-migration-credentials' );
};

const useCancelllation = ( site: SiteDetails ) => {
	const dispatch = useDispatch();
	const invalidateSiteExcerptsQuery = useSiteExcerptsQueryInvalidator();

	const {
		mutate: mutateCancelMigration,
		isSuccess: isCancellationSuccess,
		isPending: isCancelling,
		error: cancellationError,
	} = useMigrationCancellation( site.ID );

	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const [ errorNoticeDismissed, setErrorNoticeDismissed ] = useState( false );

	const reloadSite = useCallback( () => {
		dispatch( requestSite( site.ID ) );
		// invalidate the site excerpts query to refresh the /sites sidebar
		invalidateSiteExcerptsQuery();
	}, [ dispatch, invalidateSiteExcerptsQuery, site.ID ] );

	useEffect( () => {
		if ( isCancellationSuccess ) {
			recordTracksEvent( 'calypso_pending_migration_canceled' );
			reloadSite();
		}
	}, [ isCancellationSuccess, reloadSite ] );

	useEffect( () => {
		if ( cancellationError ) {
			recordTracksEvent( 'calypso_pending_migration_cancel_error', { error: cancellationError } );
		}
	}, [ cancellationError ] );

	const openModal = useCallback( () => {
		setIsModalVisible( true );
	}, [] );

	const closeModal = useCallback( () => {
		setIsModalVisible( false );
	}, [] );

	const dismissErrorNotice = useCallback( () => {
		setErrorNoticeDismissed( true );
	}, [] );

	const cancelMigration = useCallback( () => {
		setErrorNoticeDismissed( false );
		mutateCancelMigration();
		setIsModalVisible( false );
	}, [ mutateCancelMigration ] );

	return {
		isModalVisible,
		isLoading: isCancelling || isCancellationSuccess,
		showErrorNotice: cancellationError && ! errorNoticeDismissed,
		cancelMigration,
		openModal,
		closeModal,
		dismissErrorNotice,
	};
};

export const MigrationPending = ( { site }: { site: SiteDetails } ) => {
	const continueMigrationUrl = getContinueMigrationUrl( site );

	const title = translate( 'Your WordPress site is ready to be migrated' );
	const subTitle = translate(
		'Start your migration today and get ready for unmatched WordPress hosting.'
	);

	const {
		isModalVisible: isCancellationModalVisible,
		isLoading: isCancelling,
		cancelMigration,
		openModal: openCancellationModal,
		closeModal: closeCancellationModal,
		showErrorNotice: showCancellationErrorNotice,
		dismissErrorNotice: dismissCancellationErrorNotice,
	} = useCancelllation( site );

	if ( isCancelling ) {
		return (
			<LoadingPlaceholder
				aria-busy
				aria-label="Cancelling migration"
				className="migration-pending__loading-placeholder"
			/>
		);
	}

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
							{ translate( 'Start your migration' ) }
						</HostingHeroButton>
						<Button
							variant="link"
							className="migration-pending__cancel-button"
							onClick={ openCancellationModal }
						>
							{ translate( 'Cancel migration' ) }
						</Button>
					</div>
				) }
			</Header>
			<Cards />
		</Container>
	);
};
