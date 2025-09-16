import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import PageLayout from '../../components/page-layout';
import { getSiteMigrationState } from '../../utils/site-status';
import { InProgressContentInfo } from './in-progress-content-info';
import { PendingContentInfo } from './pending-content-info';
import { StartedDIFMContentInfo } from './started-difm-content-info';

export default function SiteMigrationOverview( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const migrationState = getSiteMigrationState( site );

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
