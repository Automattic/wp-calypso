import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import ConfirmModal from 'calypso/components/confirm-modal';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
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

export const MigrationPending = ( { site }: { site: SiteDetails } ) => {
	const continueMigrationUrl = getContinueMigrationUrl( site );
	const [ isConfirmModalVisible, setIsConfirmModalVisible ] = useState( false );

	const title = translate( 'Your WordPress site is ready to be migrated' );
	const subTitle = translate(
		'Start your migration today and get ready for unmatched WordPress hosting.'
	);

	const {
		mutate: cancelMigration,
		isSuccess: isCancellationSuccess,
		isPending: isCancelling,
		error: cancellationError,
	} = useMigrationCancellation( site.ID );
	const dispatch = useDispatch();

	const reloadSite = useCallback( () => {
		dispatch( requestSite( site.ID ) );
	}, [ dispatch, site.ID ] );

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

	const handleCancelButtonClick = useCallback( () => {
		cancelMigration();
		setIsConfirmModalVisible( false );
	}, [ cancelMigration ] );

	if ( isCancelling || isCancellationSuccess ) {
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
				isVisible={ isConfirmModalVisible }
				onCancel={ () => setIsConfirmModalVisible( false ) }
				onConfirm={ handleCancelButtonClick }
				title={ translate( 'Cancel migration' ) }
				text={ translate(
					"When you cancel your migration your original site will stay as is. You can always restart the migration when you're ready."
				) }
				confirmButtonLabel={ translate( 'Cancel migration' ) }
				cancelButtonLabel={ translate( "Don't cancel migration" ) }
			/>
			<Header title={ title } subTitle={ subTitle }>
				{ continueMigrationUrl && (
					<div className="migration-pending__buttons">
						<HostingHeroButton href={ continueMigrationUrl }>
							{ translate( 'Start your migration' ) }
						</HostingHeroButton>
						<Button
							variant="link"
							className="migration-pending__cancel-button"
							onClick={ () => setIsConfirmModalVisible( true ) }
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
