import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import PageLayout from '../../components/page-layout';
import { getSiteMigrationState, isSiteMigrationInProgress } from '../../utils/site-status';
import { InProgressContentInfo } from './in-progress-content-info';
import { PendingContentInfo } from './pending-content-info';
import { StartedDIFMContentInfo } from './started-difm-content-info';

export default function SiteMigrationOverview( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const migrationState = getSiteMigrationState( site );
	const navigate = useNavigate();
	const migrationInProgress = isSiteMigrationInProgress( site );

	// The router-level redirect in `beforeLoad` only runs on navigation, not on
	// data updates. When a migration completes while the tab is in the background,
	// the site query is refetched on window focus and the sidebar populates with
	// regular links — but the main content area keeps showing the migration screen.
	// This effect watches the live query data and redirects as soon as
	// `isSiteMigrationInProgress` returns false.
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
