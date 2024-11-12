import { LoadingPlaceholder } from '@automattic/components';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
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

	const title = translate( 'Your WordPress site is ready to be migrated' );
	const subTitle = translate(
		'Start your migration today and get ready for unmatched WordPress hosting.'
	);
	const {
		mutate: cancelMigration,
		isSuccess: isCancellationSuccess,
		isPending: isCancelling,
	} = useMigrationCancellation( site.ID );
	const dispatch = useDispatch();

	const reloadSite = useCallback( () => {
		dispatch( requestSite( site.ID ) );
	}, [ dispatch, site.ID ] );

	useEffect( () => {
		if ( isCancellationSuccess ) {
			reloadSite();
		}
	}, [ isCancellationSuccess, reloadSite ] );

	const handleCancelButtonClick = useCallback( () => {
		cancelMigration();
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
			<Header title={ title } subTitle={ subTitle }>
				{ continueMigrationUrl && (
					<div className="migration-pending__buttons">
						<HostingHeroButton href={ continueMigrationUrl }>
							{ translate( 'Start your migration' ) }
						</HostingHeroButton>
						<Button
							variant="link"
							className="migration-pending__cancel-button"
							onClick={ handleCancelButtonClick }
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
