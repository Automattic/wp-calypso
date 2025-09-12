import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import PageLayout from '../../components/page-layout';
import { getSiteMigrationState } from '../../utils/site-status';
import { InProgressContentInfo } from './in-progress-content-info';
import { PendingContentInfo } from './pending-content-info';

export default function SiteMigrationOverview( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const migrationState = getSiteMigrationState( site );

	function getContent() {
		if ( migrationState?.status === 'pending' ) {
			return <PendingContentInfo site={ site } type={ migrationState?.type } />;
		}

		return <InProgressContentInfo site={ site } />;
	}

	return <PageLayout>{ getContent() }</PageLayout>;
}
