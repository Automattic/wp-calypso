import { LoadingPlaceholder } from '@automattic/components';
import { setSelectedSite } from '@automattic/data-stores/src/onboard/actions';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { addQueryArgs } from 'calypso/lib/url';
import { getMigrationType } from 'calypso/sites-dashboard/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { isRequestingSite } from 'calypso/state/sites/selectors';
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

// Hook to force a site reload after migration cancellation
// This is used to clear the migration status from the site state
const useForceSiteRefresh = ( siteId: number ) => {
	const [ isRefreshing, setIsRefreshing ] = useState( false );
	const isSiteRefreshing = useSelector( ( state ) => isRequestingSite( state, siteId ) );
	const isRefreshCompleted = isSiteRefreshing === false && isRefreshing;
	const dispatch = useDispatch();

	useEffect( () => {
		if ( isRefreshCompleted ) {
			window.location.reload();
		}
	}, [ isRefreshCompleted ] );

	const forceSiteReload = () => {
		dispatch( setSelectedSite( siteId ) );
		dispatch( requestSite( siteId ) );
		setIsRefreshing( true );
	};

	return { forceSiteReload, isRefreshing };
};

export const MigrationPending = ( { site }: { site: SiteDetails } ) => {
	const {
		mutate: cancelMigration,
		isSuccess: isCancellationSuccess,
		isPending: isCancelling,
	} = useMigrationCancellation( site.ID );
	const { forceSiteReload, isRefreshing } = useForceSiteRefresh( site.ID );

	useEffect( () => {
		if ( isCancellationSuccess ) {
			forceSiteReload();
		}
	}, [ isCancellationSuccess, forceSiteReload ] );

	const handleCancelButtonClick = useCallback( () => {
		cancelMigration();
	}, [ cancelMigration ] );

	if ( isCancelling || isRefreshing ) {
		return (
			<LoadingPlaceholder
				aria-busy
				aria-label="Cancelling migration"
				className="migration-pending__loading-placeholder"
			/>
		);
	}

	const continueMigrationUrl = getContinueMigrationUrl( site );

	return (
		<Container>
			<Header
				title={ translate( 'Your WordPress site is ready to be migrated' ) }
				subTitle={ translate(
					'Start your migration today and get ready for unmatched WordPress hosting.'
				) }
			>
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
