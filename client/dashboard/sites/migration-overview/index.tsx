import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import PageLayout from '../../components/page-layout';
import {
	getSiteMigrationState,
	isSiteMigrationInProgress,
	isWordPressMigration,
} from '../../utils/site-status';
import { InProgressContentInfo } from './in-progress-content-info';
import { PendingContentInfo } from './pending-content-info';
import { StartedDIFMContentInfo } from './started-difm-content-info';
import { WordPressMigration } from './wordpress';

export default function SiteMigrationOverview( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const migrationState = getSiteMigrationState( site );
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

	if ( isWordPressMigration( site ) ) {
		return <WordPressMigration site={ site } />;
	}

	if ( migrationState?.status === 'pending' ) {
		return (
			<PageLayout>
				<PendingContentInfo site={ site } type={ migrationState?.type } />
			</PageLayout>
		);
	}

	if ( migrationState?.type === 'difm' ) {
		return (
			<PageLayout size="small">
				<StartedDIFMContentInfo site={ site } />
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<InProgressContentInfo site={ site } />
		</PageLayout>
	);
}
