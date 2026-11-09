import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getSiteDisplayName } from '../../utils/site-name';
import {
	getSiteMigrationState,
	isAssistedWordPressMigration,
	isSiteMigrationInProgress,
	isWordPressMigration,
} from '../../utils/site-status';
import { AssistedWordPressMigration } from './assisted-wordpress';
import { InProgressContentInfo } from './in-progress-content-info';
import { PendingContentInfo } from './pending-content-info';
import { StartedDIFMContentInfo } from './started-difm-content-info';
import { WordPressMigration } from './wordpress';
import type { Site } from '@automattic/api-core';

export default function SiteMigrationOverview( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate();
	const migrationInProgress = isSiteMigrationInProgress( site );

	// The `beforeLoad` redirect only runs on navigation, so this handles the
	// migration completing while the page is open (e.g. refetch on window focus).
	useEffect( () => {
		if ( ! migrationInProgress ) {
			navigate( {
				to: '/sites/$siteSlug',
				params: { siteSlug },
				replace: true,
				viewTransition: false,
			} );
		}
	}, [ migrationInProgress, navigate, siteSlug ] );

	return (
		<PageLayout size="small" header={ <PageHeader title={ getSiteDisplayName( site ) } /> }>
			<MigrationView site={ site } />
		</PageLayout>
	);
}

// The views behind the migration flag go by the migration type the site reports, the older ones by their flow sticker.
function MigrationView( { site }: { site: Site } ) {
	if ( isWordPressMigration( site ) ) {
		return <WordPressMigration site={ site } />;
	}

	if ( isAssistedWordPressMigration( site ) ) {
		return <AssistedWordPressMigration site={ site } />;
	}

	const migrationState = getSiteMigrationState( site );
	if ( migrationState?.status === 'pending' ) {
		return <PendingContentInfo site={ site } type={ migrationState.type } />;
	}

	if ( migrationState?.type === 'difm' ) {
		return <StartedDIFMContentInfo site={ site } />;
	}

	return <InProgressContentInfo site={ site } />;
}
